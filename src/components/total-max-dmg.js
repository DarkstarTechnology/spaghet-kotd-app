/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';

const TotalMaxDmg = ({ bossData }) => {

    const [ bosses ] = useState(bossData);
    const [totalMaxDmg, updateMaxDmg] = useState()

    useEffect(() => {
      console.log(bosses)
      if(bosses?.length) {
        updateMaxDmg(bosses.reduce((acc, boss) => acc + (boss?.maxDmg ?? 0), 0))
      }
    }, [bosses]);
    
    
  return (
    <h4 style={{color: '#FFFFFF'}}>Total Max Damage: 💥{totalMaxDmg}</h4>
  );
};

export { TotalMaxDmg };