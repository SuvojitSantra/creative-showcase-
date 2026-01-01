import os
import uuid
import streamlit as st
from supabase import create_client


def get_supabase():
    url = st.secrets.get("SUPABASE_URL") or os.getenv("SUPABASE_URL")
    key = st.secrets.get("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        st.warning("Set SUPABASE_URL and SUPABASE_ANON_KEY in Streamlit secrets or env vars.")
        return None
    return create_client(url, key)


def list_artworks(supabase):
    try:
        res = supabase.table("artworks").select("*").order("id", {"ascending": True}).execute()
        return res.data or []
    except Exception as e:
        st.error(f"Error fetching artworks: {e}")
        return []


def upload_artwork(supabase, file, title, user_id="public"):
    try:
        ext = file.name.split(".")[-1]
        file_path = f"{user_id}/{uuid.uuid4()}.{ext}"
        file_bytes = file.read()

        # Upload to storage
        supabase.storage.from_("showcase-images").upload(file_path, file_bytes)

        # Construct public URL (stable pattern for Supabase storage)
        url = (st.secrets.get("SUPABASE_URL") or os.getenv("SUPABASE_URL"))
        public_url = f"{url}/storage/v1/object/public/showcase-images/{file_path}"

        # Insert DB record
        supabase.table("artworks").insert({"title": title, "image_url": public_url, "user_id": user_id}).execute()
        st.success("Uploaded successfully")
    except Exception as e:
        st.error(f"Upload failed: {e}")


def main():
    st.set_page_config(page_title="Creative Showcase", layout="wide")
    st.title("Creative Showcase — Streamlit")

    supabase = get_supabase()
    if not supabase:
        return

    col1, col2 = st.columns([3, 1])

    with col2:
        st.header("Upload")
        uploaded_file = st.file_uploader("Choose an image", type=["png", "jpg", "jpeg", "webp"], accept_multiple_files=False)
        title = st.text_input("Title")
        if st.button("Upload"):
            if not uploaded_file or not title:
                st.warning("Provide a title and an image")
            else:
                upload_artwork(supabase, uploaded_file, title)

        st.markdown("---")
        if st.button("Refresh gallery"):
            st.experimental_rerun()

    with col1:
        st.header("Gallery")
        artworks = list_artworks(supabase)
        if not artworks:
            st.info("No artworks found.")
            return

        # Display as grid
        cols = st.columns(3)
        for i, art in enumerate(artworks):
            c = cols[i % 3]
            with c:
                st.image(art.get("image_url"), caption=art.get("title"), use_column_width=True)
                st.markdown(f"[Open full image]({art.get('image_url')})")


if __name__ == "__main__":
    main()
