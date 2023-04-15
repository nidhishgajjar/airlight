import { useEffect } from "react";

// export const UpdateNotifications = () => {
//   const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;
//   useEffect(() => {
//     const handleUpdateAvailable = () => {
//       const notification = new Notification("Update available", {
//         body: "A new version is available. Downloading now...",
//       });
//     };

//     const handleUpdateDownloaded = () => {
//       const notification = new Notification("Update ready", {
//         body: "A new version has been downloaded. Restart the app to apply the update.",
//       });

//       notification.onclick = () => {
//         ipcRenderer.send("restart-app");
//         };
//       };

//       if (ipcRenderer) {
//         ipcRenderer.on("update-available", handleUpdateAvailable);
//         ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
//       }

//     return () => {
//       if (ipcRenderer) {
//         ipcRenderer.removeListener(
//           "update-available",
//           handleUpdateAvailable
//         );
//         ipcRenderer.removeListener(
//           "update-downloaded",
//           handleUpdateDownloaded
//         );
//       }
//     };
//   }, []);

//   return null;
// };

// export default UpdateNotifications;
export const UpdateNotifications = () => {
  const ipcRenderer = window.electron ? window.electron.ipcRenderer : null;

  useEffect(() => {
    const handleUpdateAvailable = () => {
      const notification = new Notification("Update available", {
        body: "A new version is available. Downloading now...",
      });
    };

    const handleUpdateDownloaded = () => {
      const notification = new Notification("Update ready", {
        body: "A new version has been downloaded. Click to apply the update.",
      });

      notification.onclick = () => {
        if (ipcRenderer) {
          ipcRenderer.send("restart-app");
          // Quit the app after sending the restart-app event
          ipcRenderer.send("quit-app");
        }
      };
    };

    const handleUpdateError = (event, error) => {
      console.error("Update error:", error);
      const notification = new Notification("Update error", {
        body: "An error occurred while updating the app. Please try again later.",
      });
    };

    if (ipcRenderer) {
      ipcRenderer.on("update-available", handleUpdateAvailable);
      ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
      ipcRenderer.on("update-error", handleUpdateError);
    }

    return () => {
      if (ipcRenderer) {
        ipcRenderer.removeListener("update-available", handleUpdateAvailable);
        ipcRenderer.removeListener("update-downloaded", handleUpdateDownloaded);
        ipcRenderer.removeListener("update-error", handleUpdateError);
      }
    };
  }, []);

  return null;
};
