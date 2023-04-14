import { useEffect } from "react";

export const UpdateNotifications = () => {
  useEffect(() => {
    const handleUpdateAvailable = () => {
      const notification = new Notification("Update available", {
        body: "A new version is available. Downloading now...",
      });
    };

    const handleUpdateDownloaded = () => {
      const notification = new Notification("Update ready", {
        body: "A new version has been downloaded. Restart the app to apply the update.",
      });

      notification.onclick = () => {
        window.ipcRenderer.send("restart-app");
      };
    };

    window.ipcRenderer.on("update-available", handleUpdateAvailable);
    window.ipcRenderer.on("update-downloaded", handleUpdateDownloaded);

    return () => {
      window.ipcRenderer.removeListener(
        "update-available",
        handleUpdateAvailable
      );
      window.ipcRenderer.removeListener(
        "update-downloaded",
        handleUpdateDownloaded
      );
    };
  }, []);

  return null;
};

export default UpdateNotifications;
