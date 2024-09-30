import { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import {Link, Button} from '@mui/material';
import { LensTwoTone } from '@mui/icons-material';
import CountDownTimer from './countdowntimer';

// created function to handle API request

const renderTime = (dimension, time) => {
  return (
    <div className="time-wrapper">
      <div className="time">{time}</div>
      <div>{dimension}</div>
    </div>
  );
};

const BossTimer = ({ data }) => {
  const [timerSet, setTime] = useState(true)

  try {
      const boss = data.boss;
      const expireTime = data.expireTime || new Date();
      const nowDateTime = new Date();
      const remainingTime = Math.ceil((expireTime.getTime() - nowDateTime.getTime()) / 1000);
      const timeLeft = expireTime ? remainingTime > 0 ? Math.ceil((expireTime.getTime() - nowDateTime.getTime()) / 1000) : 0 : 0;
      const minuteSeconds = 60;
      const hourSeconds = 3600;
      //const daySeconds = 86400;
      
      const toggleTimer = () => {
        setTime(!timerSet);
      }
    
    
      const getTimeMinutes = (time) => ((time % hourSeconds) / minuteSeconds) | 0;
      const getTimeSeconds = (time) => (Math.ceil(time % 60)) | 0;
    
      if(navigator.serviceWorker) {
        navigator.serviceWorker.register('sw.js');
        Notification.requestPermission(function (result) {});
      }
  

      const notificationFired = () => {
        sessionStorage.setItem(`${boss.id}-notification`, true)
      }
    
      const fireNotification = (totalElapsedTime) => {
        const fired = !!sessionStorage.getItem(`${boss.id}-notification`);
        if(!fired && navigator.serviceWorker) {
          navigator.serviceWorker.ready.then(function (registration) {
            registration.showNotification(`Come hit ${boss.title}!`);
            notificationFired();
          });
        }
      }
    
      return (
        <>
          {timerSet && (<CountDownTimer
            duration={hourSeconds}
            colors={[boss.flair.color]}
            colorValues={[100]}
            onComplete={fireNotification}
            initialRemainingTime={timeLeft % hourSeconds}
            size={100}
            strokeWidth={3}
            isActive={timerSet}
            toggle={toggleTimer}
            display={({ timeRemaining }) => {
              if(timeRemaining > 0) {
                return (
                  <span style={{ fontSize: '13px', position: 'absolute', left: 25, top: 6}}>
                    {renderTime("minutes", getTimeMinutes(timeRemaining))}
                    {renderTime("seconds", getTimeSeconds(timeRemaining))}
                  </span>
                )
              } else {
                return (<h5 style={{ position: 'absolute', left: 25, top: 6}}>Can<br />Bonk!</h5>)
              }
            }}
          />)}
          {!timerSet && (<Button onClick={toggleTimer}>Start Timer</Button>)}
        </>
      );
  } catch (e) {
    console.log(e);
    return <div>Error Loading Timer!</div>
  }
};

export { BossTimer };