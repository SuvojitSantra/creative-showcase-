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
        res = anon_client.table("artworks").select("*").order("id", ascending=True).execute()
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

        # Insert DB record using admin client (bypasses RLS) so user_id must be explicitly provided
        admin_client.table("artworks").insert({"title": safe_title, "image_url": public_url, "user_id": user_id}).execute()

        st.success("Uploaded successfully")
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
        user_id = st.text_input("User ID (uuid)", value="public")

        if st.button("Upload"):
            if not uploaded_file or not title:
                st.warning("Provide a title and an image")
            else:
                upload_artwork(url, admin, uploaded_file, title, user_id=user_id)

        st.markdown("---")
        if st.button("Refresh gallery"):
            st.experimental_rerun()

    with col1:
        st.header("Gallery")
        artworks = list_artworks(anon)
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
    main()
