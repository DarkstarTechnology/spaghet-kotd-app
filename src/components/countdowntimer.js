import {
    Box,
    CircularProgress,
    makeStyles,
    Typography
  } from "@material-ui/core";
  import { findIndex, forEach } from "lodash";
  import { useEffect, useState, useMemo } from "react";
  
  import { clearInterval, setInterval } from "worker-timers";
  
  const useStylesCountDown = makeStyles((theme) => ({
    container: {
      position: "relative",
      width: "100%",
      height: "auto",
      backgroundColor: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    root: {
      position: "relative"
    },
    bottom: {
      color: "#b2b2b2"
    },
    top: {
      animationDuration: "100ms",
      position: "absolute",
      left: 0
    },
    circle: {
      strokeLinecap: "round"
    },
    text: {
      fontWeight: "bold",
      fontSize: "1.35em",
      marginTop: "1em",
      position: 'absolute'
    }
  }));
  
  const CountDownTimer = (props) => {
    const classes = useStylesCountDown();
    const { duration = 100, 
            colors = [], 
            colorValues = [], 
            onComplete, size = 80, 
            initialRemainingTime = duration, 
            strokeWidth = 4, 
            display, 
            isActive = false, 
            toggle } = props;

    const [timeRemaining, setTimeRemaining] = useState(Math.ceil(initialRemainingTime));
    const [countdownPercentage, setCountdownPercentage] = useState(Math.ceil((initialRemainingTime / duration) * 100));
    const [countdownColor, setCountdownColor] = useState(colors.length ? colors.at(0) : "#004082");
    const [notified, setNotified] = useState(false);
  
    useEffect(() => {
      if(!notified) {
        let intervalId = setInterval(() => {
          setTimeRemaining((prev) => {
            const newTimeDuration = prev - 1;
            const percentage = Math.ceil((newTimeDuration / duration) * 100);
            setCountdownPercentage(percentage);
    
            if (newTimeDuration <= 0) {
              clearInterval(intervalId);
              intervalId = null;
              setNotified(true)
              onComplete();
              setTimeRemaining(0);
            }
    
            return newTimeDuration;
          });
        }, 1000);
    
        return () => {
          clearInterval(intervalId);
          intervalId = null;
        };
      }

      return () => {
        console.log('test')
      };

    }, []);
  
    useEffect(() => {
      for (let i = 0; i < colorValues.length; i++) {
        const item = colorValues[i];
        if (timeRemaining <= item) {
          setCountdownColor(colors[i]);
          break;
        }
      }
    }, [timeRemaining]);
  
    return (
      <>
        <Box className={classes.container}>
          <Box className={classes.root} style={{position: 'relative'}}>
            {isActive && (<>
              <CircularProgress
                variant="determinate"
                className={classes.bottom}
                size={size}
                thickness={strokeWidth}
                value={100}
              />
              <CircularProgress
                className={classes.top}
                classes={{
                  circle: classes.circle
                }}
                variant="determinate"
                size={size}
                thickness={strokeWidth}
                value={countdownPercentage}
                style={{
                  transform: "scaleX(-1) rotate(-90deg)",
                  color: countdownColor
                }}
              />
              {display({timeRemaining})}
            </>)}
          </Box>
        </Box>
      </>
    );
  };
  
  export default CountDownTimer;
  