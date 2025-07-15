import { bucket } from "../firebaseAdmin.js";

export async function getLatestSnapshot(req, res) {
  try {
    const [files] = await bucket.getFiles({ prefix: "snapshots/" });

    const snapshots = files
      .filter((file) => file.name.endsWith(".jpg"))
      .sort((a, b) => a.name.localeCompare(b.name));

    const latest = snapshots.at(-1);

    if (!latest) {
      return res.status(404).json({ error: "No snapshots found" });
    }

    await latest.makePublic();

    const latestFilename = latest.name.split("/").pop();
    let latestDatetime = "Unknown";

    const latestMatch = latestFilename.match(
      /snapshot-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/
    );

    if (latestMatch) {
      const [_, year, month, day, hour, minute, second] = latestMatch;
      const utcDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
      );

      latestDatetime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(utcDate);
    }

    // Get last 6 before the latest
    const recentHistory = snapshots.slice(-7, -1).reverse();

    const historyData = await Promise.all(
      recentHistory.map(async (file) => {
        await file.makePublic();
        const filename = file.name.split("/").pop(); // e.g., snapshot_20250709_135500.jpg

        const match = filename.match(
          /snapshot-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/
        );
        let datetime = "Unknown";

        if (match) {
          const [_, year, month, day, hour, minute, second] = match;
          const utcDate = new Date(
            Date.UTC(year, month - 1, day, hour, minute, second)
          );
          datetime = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }).format(utcDate);
        }

        return {
          url: file.publicUrl(),
          name: filename,
          datetime,
        };
      })
    );

    console.log(historyData);
    return res.status(200).json({
      latest: { url: latest.publicUrl(), datetime: latestDatetime },
      history: historyData,
    });
  } catch (err) {
    console.error("❌ Failed to get latest snapshot:", err);
    res
      .status(500)
      .json({ error: "Failed to get snapshot", details: err.message });
  }
}
