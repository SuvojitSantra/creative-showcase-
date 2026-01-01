import os
import uuid
import streamlit as st
from supabase import create_client

# Configuration
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB
ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "gif"}


def get_clients():
    url = st.secrets.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
    anon_key = st.secrets.get("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")
    service_key = st.secrets.get("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not anon_key:
        st.warning("Set SUPABASE_URL and SUPABASE_ANON_KEY in Streamlit secrets or env vars.")
        return None, None, None

    anon = create_client(url, anon_key)
    admin = None
    if service_key:
        admin = create_client(url, service_key)

    return url, anon, admin


def list_artworks(anon_client):
    try:
        res = anon_client.table("artworks").select("*").execute()
        return res.data or []
    except Exception as e:
        st.error(f"Error fetching artworks: {e}")
        return []


def validate_file(uploaded_file):
    if not uploaded_file:
        return "No file provided"
    content_type = getattr(uploaded_file, "type", "")
    if not content_type.startswith("image/"):
        return "Unsupported file type"
    size = getattr(uploaded_file, "size", None)
    if size is not None and size > MAX_UPLOAD_BYTES:
        return f"File too large (max {MAX_UPLOAD_BYTES // (1024*1024)} MB)"
    ext = uploaded_file.name.split(".")[-1].lower()
    if ext not in ALLOWED_EXT:
        return f"Extension not allowed: {ext}"
    return None


def upload_artwork(url, admin_client, uploaded_file, title, user_id="public"):
    if admin_client is None:
        st.error("Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to Streamlit secrets for uploads.")
        return

    err = validate_file(uploaded_file)
    if err:
        st.error(err)
        return

    safe_title = title.strip().replace("\n", " ")[:200]
    ext = uploaded_file.name.split(".")[-1].lower()
    file_path = f"{user_id}/{uuid.uuid4()}.{ext}"

    try:
        file_bytes = uploaded_file.read()

        # Upload to storage (service role client)
        admin_client.storage.from_("showcase-images").upload(file_path, file_bytes)

        public_url = f"{url}/storage/v1/object/public/showcase-images/{file_path}"

        # NOTE: we intentionally DO NOT insert into the `artworks` table here because
        # `user_id` in your table is a UUID that must reference an existing auth.user.
        # Inserting with an invalid user_id (for example the literal string "public")
        # causes a database error. To keep uploads working immediately, we upload
        # files to the public storage bucket and show them from storage.
        st.success("Uploaded successfully")
        st.write("Public URL:", public_url)
    except Exception as e:
        st.error(f"Upload failed: {e}")


def main():
    st.set_page_config(page_title="Creative Showcase", layout="wide")
    st.title("Creative Showcase — Streamlit")

    url, anon, admin = get_clients()
    if not url or not anon:
        return

    col1, col2 = st.columns([3, 1])

    with col2:
        st.header("Upload")
        uploaded_file = st.file_uploader("Choose an image", type=list(ALLOWED_EXT), accept_multiple_files=False)
        title = st.text_input("Title")
        if st.button("Upload"):
            if not uploaded_file or not title:
                st.warning("Provide a title and an image")
            else:
                # Upload to storage only (no DB insert) to avoid invalid UUID errors
                upload_artwork(url, admin, uploaded_file, title)

        st.markdown("---")
        if st.button("Refresh gallery"):
            st.experimental_rerun()

    with col1:
        st.header("Gallery")
        artworks = list_artworks(anon)

        # If DB has no artworks or DB listing failed, fall back to listing storage objects
        if not artworks:
            try:
                storage_client = admin or anon
                res = storage_client.storage.from_("showcase-images").list()
                objs = res.data or []
                artworks = []
                for o in objs:
                    name = o.get("name") or o.get("Key") or o.get("path")
                    if not name:
                        continue
                    public_url = f"{url}/storage/v1/object/public/showcase-images/{name}"
                    artworks.append({"title": name, "image_url": public_url})
            except Exception:
                artworks = []

        if not artworks:
            st.info("No artworks found.")
            return

        cols = st.columns(3)
        for i, art in enumerate(artworks):
            c = cols[i % 3]
            with c:
                st.image(art.get("image_url"), caption=art.get("title"), use_column_width=True)
                st.markdown(f"[Open full image]({art.get('image_url')})")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Catch unhandled exceptions and show a readable traceback in the UI
        import traceback
        try:
            st.error(f"Unhandled error: {repr(e)}")
            st.text(traceback.format_exc())
        except Exception:
            # If Streamlit is not available for some reason, print to stdout
            print("Unhandled error:", repr(e))
            traceback.print_exc()
