import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";


function PlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");

  const token = localStorage.getItem("token");

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/playlists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setPlaylists(data);
    } catch (error) {
      console.error(error);
    }
  };

  const createPlaylist = async () => {
    if (!name.trim()) {
      alert("Enter playlist name");
      return;
    }

    try {
      await fetch(
        "http://localhost:8000/api/playlists",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      setName("");
      fetchPlaylists();

    toast.success("Playlist Created!");
    } catch (error) {
      console.error(error);
    }
  };

  const renamePlaylist = async (
  playlistId,
  currentName
) => {
  const newName = prompt(
    "Enter new playlist name",
    currentName
  );

  if (!newName) return;

  try {
    await fetch(
      `http://localhost:8000/api/playlists/${playlistId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",
          Authorization:
            `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
        }),
      }
    );

    fetchPlaylists();

    alert("Playlist renamed!");
  } catch (error) {
    console.error(error);
  }
};

  const deletePlaylist = async (
    playlistId
  ) => {
    try {
      await fetch(
        `http://localhost:8000/api/playlists/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPlaylists();

    toast.success("Playlist Deleted!");
    } catch (error) {
      console.error(error);
    }
  };

  const removeVideo = async (
    playlistId,
    videoId
  ) => {
    try {
      await fetch(
        `http://localhost:8000/api/playlists/${playlistId}/video/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPlaylists();

    toast.success("Video Removed!");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h1>📁 My Playlists</h1>

      <div
        style={{
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Playlist Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={{
            padding: "10px",
            width: "250px",
          }}
        />

        <button
          onClick={createPlaylist}
          style={{
            marginLeft: "10px",
            padding: "10px 15px",
          }}
        >
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <h3>No Playlists Yet</h3>
      ) : (
        playlists.map((playlist) => (
          <div
            key={playlist._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "20px",
            }}
          >
           <Link
  to={`/playlists/${playlist._id}`}
  style={{
    textDecoration: "none",
    color: "#4da6ff",
  }}
>
  <h3>{playlist.name}</h3>
  <button
  onClick={() =>
    renamePlaylist(
      playlist._id,
      playlist.name
    )
  }
>
  ✏️ Rename
</button>
</Link>

         <h3>No Playlists Yet</h3>
         

            <p>
              Videos:{" "}
              {playlist.videos.length}
            </p>

            <button
              onClick={() =>
                deletePlaylist(
                  playlist._id
                )
              }
              style={{
                marginBottom: "15px",
              }}
            >
              🗑 Delete Playlist
            </button>

            {playlist.videos.map(
              (video) => (
                <div
                  key={video.videoId}
                  style={{
                    display: "flex",
                    gap: "15px",
                    padding: "10px",
                    marginBottom: "10px",
                    border:
                      "1px solid #444",
                    borderRadius: "8px",
                  }}
                >
                  <Link
                    to={`/video/${video.videoId}`}
                  >
                    <img
                      src={
                        video.thumbnail
                      }
                      alt={video.title}
                      width="180"
                    />
                  </Link>

                  <div>
                    <Link
                      to={`/video/${video.videoId}`}
                      style={{
                        textDecoration:
                          "none",
                        color:
                          "inherit",
                      }}
                    >
                      <h4>
                        {video.title}
                      </h4>
                    </Link>

                    <p>
                      {video.channel}
                    </p>

                    <button
                      onClick={() =>
                        removeVideo(
                          playlist._id,
                          video.videoId
                        )
                      }
                    >
                      ❌ Remove Video
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default PlaylistsPage;