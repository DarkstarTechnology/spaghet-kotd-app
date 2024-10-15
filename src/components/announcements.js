import { useState, useEffect } from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import useWebSocket from 'react-use-websocket';

const Announcements = ({text, title, variant}) => {
  const [storedPlayerName] = useState(localStorage.getItem('storedPlayerName'));
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState({message: '', severity: '', for: ''});

  const wsOptions = {
    reconnectInterval: 3000,
    heartbeat: {
      message: JSON.stringify({storedPlayerName, version: process.env.REACT_APP_VERSION}),
      returnMessage: 'pong',
      timeout: 60000,
      interval: 25000,
    },
    retryOnError: true
  };
  const { lastJsonMessage: incomingAnnouncement } = useWebSocket('wss://api.spaghet.io/ws/kotd/announcements', wsOptions);
  

  useEffect(() => {
    if(incomingAnnouncement) {
      const announcement = incomingAnnouncement;
      if(announcement.message === 'forceReload') {
        window.location.reload(true);
        return;
      }
      if(announcement.for === 'All' || announcement.for.toLowerCase() === storedPlayerName.toLowerCase()) {
        setAnnouncement(announcement);
        setOpen(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingAnnouncement])

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