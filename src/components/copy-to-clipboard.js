import { useState } from "react";
import { Snackbar } from "@mui/material";
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import Button from '@mui/material/Button';

const CopyToClipboardButton = ({text, title, variant}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <Button onClick={handleClick} color="secondary" title={title || `Copy "${text}"`} variant={variant || 'text'}>
        <ContentCopyRoundedIcon />
      </Button>
      <Snackbar
        message={'Copied "' + text + '" to clipboard'}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        onClose={() => setOpen(false)}
        open={open}
      />
    </>
  );
};

export { CopyToClipboardButton }