import json
import os
import re

from bs4 import BeautifulSoup


def extract_artist_data(html_file_path):
    """Extract artist and song data from a single HTML file."""
    with open(html_file_path, "r", encoding="utf-8") as file:
        content = file.read()

    soup = BeautifulSoup(content, "html.parser")

    # Extract artist name from title
    title_tag = soup.find("title")
    if not title_tag:
        print(f"No title tag found in {html_file_path}")
        return None

    title_text = title_tag.get_text()
    artist_match = re.search(r"(.*?) - Spotify Top Songs", title_text)
    if not artist_match:
        print(f"Could not extract artist name from title: {title_text}")
        return None

    artist_name = artist_match.group(1).strip()

    # Extract artist ID from the URL in the HTML
    artist_id_match = re.search(r'/spotify/artist/([^_]+)_songs\.html">Songs</a>', content)
    if not artist_id_match:
        print(f"Could not extract artist ID from {html_file_path}")
        return None

    artist_id = artist_id_match.group(1)

    # Find the songs table
    table = soup.find("table", class_="addpos sortable")
    if not table:
        print(f"No songs table found in {html_file_path}")
        return None

    songs_data = []

    # Extract songs from table rows
    rows = table.find("tbody").find_all("tr") if table.find("tbody") else []

    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 3:
            continue

        # Extract track name and ID from the first cell
        track_cell = cells[0]
        track_link = track_cell.find("a")

        if not track_link:
            continue

        # Extract track ID from Spotify URL
        track_url = track_link.get("href", "")
        track_id_match = re.search(r'https://open\.spotify\.com/track/([^"]+)', track_url)
        if not track_id_match:
            continue

        track_id = track_id_match.group(1)
        track_name = track_link.get_text().strip()

        # Extract total streams and daily streams
        total_streams = cells[1].get_text().strip().replace(",", "")
        daily_streams = cells[2].get_text().strip().replace(",", "")

        # Convert to integers if possible
        try:
            total_streams = int(total_streams)
        except ValueError:
            total_streams = total_streams

        try:
            daily_streams = int(daily_streams)
        except ValueError:
            daily_streams = daily_streams

        song_data = {
            "artist": artist_name,
            "artistId": artist_id,
            "trackName": track_name,
            "trackId": track_id,
            "total": total_streams,
            "daily": daily_streams,
        }

        songs_data.append(song_data)

    return {"artist": artist_name, "artistId": artist_id, "songs": songs_data}


def process_all_files():
    """Process all HTML files in the kworb_artist_songs directory."""
    input_dir = "../../git_ignore/kworb_artist_songs"
    output_dir = "../data/artists-songs"

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    processed_count = 0

    for filename in os.listdir(input_dir):
        if filename.endswith(".html"):
            file_path = os.path.join(input_dir, filename)
            print(f"Processing {filename}...")

            try:
                artist_data = extract_artist_data(file_path)

                if artist_data:
                    # Create output filename based on artist ID
                    output_filename = f"{artist_data['artistId']}.json"
                    output_path = os.path.join(output_dir, output_filename)

                    # Write JSON file
                    with open(output_path, "w", encoding="utf-8") as f:
                        json.dump(artist_data, f, indent=2, ensure_ascii=False)

                    print(f"✓ Extracted {len(artist_data['songs'])} songs for {artist_data['artist']}")
                    processed_count += 1
                else:
                    print(f"✗ Failed to extract data from {filename}")

            except Exception as e:
                print(f"✗ Error processing {filename}: {str(e)}")

    print(f"\nProcessing complete! Processed {processed_count} files.")
    print(f"JSON files saved to: {output_dir}")


if __name__ == "__main__":
    process_all_files()
