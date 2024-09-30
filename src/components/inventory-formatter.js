import {useState} from 'react';
import "./component-css/player-inventory.css";
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { CopyToClipboardButton } from './';
import Container from '@mui/material/Container';

const InventoryFormmater = ({ playerInventory }) => {

    // const sortOptions = [
    //   'type',
    //   'damage',
    //   'element',
    //   'durability'
    // ];
    
    // const [tableSort, setSort] = React.useState('type');


    const [filters, setFilter] = useState({
      type: {
        '⚔️': false,
        '🏹': false,
        '🔮': false,
        '🎆': false,
        '🎒': false,
        '🎁': false
      },
      element: {
        Air: false,
        Bles: false,
        Curs: false,
        Erth: false,
        Fire: false,
        Moon: false,
        Org: false,
        Sun: false,
        Syn: false,
        Wtr: false,
      }
    });

    const optionLabels = {
      Air: 'https://cdn.discordapp.com/emojis/1051333997323628564.webp?size=48&quality=lossless',
      Bles: 'https://cdn.discordapp.com/emojis/1042933454708408350.webp?size=48&quality=lossless',
      Curs: 'https://cdn.discordapp.com/emojis/1042933519703343304.webp?size=48&quality=lossless',
      Erth: 'https://cdn.discordapp.com/emojis/1051333985499885648.webp?size=48&quality=lossless',
      Fire: 'https://cdn.discordapp.com/emojis/1042933464594391151.webp?size=48&quality=lossless',
      Moon: 'https://cdn.discordapp.com/emojis/1042933456579072040.webp?size=48&quality=lossless',
      Org: 'https://cdn.discordapp.com/emojis/1042933517727825980.webp?size=48&quality=lossless',
      Sun: 'https://cdn.discordapp.com/emojis/1042933458357461042.webp?size=48&quality=lossless',
      Syn: 'https://cdn.discordapp.com/emojis/1042933460475592765.webp?size=48&quality=lossless',
      Wtr: 'https://cdn.discordapp.com/emojis/1042933352770064394.webp?size=48&quality=lossless',
    };

    // const handleSortChange = (event) => {
    //   setSort(event.target.value);
    // };

    const handleFilterChange = (event) => {
      const {
        target: { checked, name, value },
      } = event;

      setFilter({
        ...filters,
        [value]: {
          ...filters[value],
          [name]: checked
        },
      });
    };

    const generateCommand = (row) => {
      switch(row.type?.displayValue) {
        case '⚔️':
          return '!melee ' + row.id.displayValue;
        case '🏹':
          return '!range ' + row.id.displayValue;
        case '🔮':
          return '!magic ' + row.id.displayValue;
        case '🎒':
          return '!use ' + row.id.displayValue;
        case '🎁':
          return '!open ' + row.id.displayValue;
        default:
          return '! ' + row.id.displayValue
      }
    }

    return (
      <Container maxWidth="xl">
        {playerInventory.tables.map((table, tIndex) => (
          <div key={tIndex} style={{maxWidth: '100%', overflow: 'auto'}}>
            <table className="inventorytable">
              <caption style={{color: '#FFFFFF'}}>
                <h5> </h5>
                <div style={{textAlign: 'center'}}>
                  {Object.keys(filters).filter(filterField => table.headerFields.indexOf(filterField) > -1).map(filter => (
                    <div key={filter}>
                      <h6 style={{margin: 0}}>{filter.toUpperCase()}</h6>
                      <FormControl component="fieldset">
                        <FormGroup aria-label="position" row>      
                          {Object.keys(filters[filter]).filter(filterItem => {
                            const itemsInTable = table.tableRows.map(tableRow => tableRow[filter].displayValue);
                            return itemsInTable.indexOf(filterItem) > -1;
                          }).map(option => (
                            <FormControlLabel
                              key={option}
                              value={option}
                              control={<Checkbox className={"filter-checkbox"} checked={filters[filter][option]} onChange={handleFilterChange} name={option} value={filter}/>}
                              label={optionLabels[option] ? <img src={optionLabels[option]} alt={option} style={{backgroundSize: 32, height: 32, width: 32}} /> : <span style={{ fontSize: '1.5em' }}>{option}</span>}
                              labelPlacement="bottom"
                              style={{padding: '5px 5px 0px 5px'}}
                              className={filters[filter][option] ? 'selected' : 'unselected'}
                            />
                          ))}
                        </FormGroup>
                      </FormControl>
                    </div>
                  ))}
                </div>
                <hr />
              </caption>
              <thead>
                <tr>
                  <th>Use</th>
                  {table.headers.map((header, hIndex) => (
                    <th key={header.title+hIndex}>{header.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.tableRows.filter(row => {
                  const filterKeys = Object.keys(filters).filter(filterKey => row[filterKey]);
                  const filtersOn = filterKeys.map(filterKey => {
                    return Object.keys(filters[filterKey]).filter(filterItem => filters[filterKey][filterItem] );
                  }).flat();
                  
                  const filtersCheck = filterKeys.map(filterKey => {
                    const rowFieldValue = row[filterKey].displayValue;
                    const tableHeaderValues = table.tableRows.map(tableRow => tableRow[filterKey].displayValue);

                    const filterItems = filtersOn.filter(filterItem => tableHeaderValues.indexOf(filterItem) > -1);

                    const filterItemCheck = filtersOn.map(filterItem => {
                      return filters[filterKey][filterItem] && (rowFieldValue === filterItem) ;
                    });


                    return filterItems.length && filterItemCheck.length ? filterItemCheck.indexOf(true) > -1 : true;
                  });

                  return filtersCheck.every(v => v);
                }).map((row, rIndex) => (
                  <tr key={JSON.stringify(row) + rIndex}>
                    <td><CopyToClipboardButton text={generateCommand(row)} /></td>
                    {table.headers.map((header, hrIndex) => (
                      <td key={JSON.stringify(row[header.field]) + hrIndex}>{
                        optionLabels[row[header.field].displayValue] ? <img src={optionLabels[row[header.field].displayValue]} alt={row[header.field].displayValue} style={{backgroundSize: 24, height: 24, width: 24}}/>
                          : row[header.field].displayValue}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </Container>
    );
};

export { InventoryFormmater };