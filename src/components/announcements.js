import { useState } from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import { setInterval  } from "worker-timers";

const initialAnnouncementWS = new WebSocket('wss://api.spaghet.io/ws/kotd/announcements');

const Announcements = ({text, title, variant}) => {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({message: '', severity: '', for: ''});
  const [announcementWS, openCommentWS] = useState(initialAnnouncementWS);
  const [storedPlayerName] = useState(localStorage.getItem('storedPlayerName'));

  announcementWS.onopen = function(event) {
    announcementWS.send(JSON.stringify({storedPlayerName, version: process.env.REACT_APP_VERSION}));
    setInterval(() => {
      announcementWS.send(JSON.stringify({storedPlayerName, version: process.env.REACT_APP_VERSION}));
    }, 30000);
  };
  
  announcementWS.onmessage = function(event) {
    const announcement = JSON.parse(event.data);
    if(announcement.message === 'forceReload') {
      window.location.reload(true);
      return;
    }
    if(announcement.for === 'All' || announcement.for.toLowerCase() === storedPlayerName.toLowerCase()) {
      setAnnouncement(announcement);
      setOpen(true);
    }
    if(announcement.for.toLowerCase() === storedPlayerName.toLowerCase()) {
      announcementWS.send(`Announcement Received for: ${storedPlayerName}`);
    }
  };

  announcementWS.onclose = function(event) {
    openCommentWS(new WebSocket('wss://api.spaghet.io/ws/kotd/announcements'));
  };

  return (
    <>
        <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        >
            <Alert
                onClose={() => setOpen(false)}
                severity={announcement.severity}
                variant="outline"
                sx={{ width: '100%', bgcolor: "background.paper" }}
            >
                <AlertTitle><strong>For: {announcement.for}</strong></AlertTitle>
                {announcement.message}
            </Alert>
        </Snackbar>
    </>
  );
};

export { Announcements }