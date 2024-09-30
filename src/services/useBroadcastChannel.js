import { useEffect, useState } from 'react';
const eventTab = sessionStorage.getItem('tabID');

const useBroadcastChannel = (channelName) => {
    const [message, setMessage] = useState({data: false, eventTab });
    const channel = new BroadcastChannel(channelName);

    useEffect(() => {
        const handleMessage = (event) => {
            setMessage({
                data: event.data,
                eventTab
            });
        };

        channel.onmessage = handleMessage;

        // Clean up the channel when the component unmounts
        return () => {
            channel.close();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, eventTab]);

    const sendMessage = (msg) => {
        channel.postMessage(msg);
    };

    return { message, sendMessage };
};

export default useBroadcastChannel;