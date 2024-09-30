import * as React from 'react';
import useSWR from 'swr';
import "./component-css/player-inventory.css";
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { CopyToClipboardButton } from '.';
import IconButton from '@mui/material/IconButton';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Moment from 'react-moment';
import Fab from '@mui/material/Fab';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import RedditIcon from '@mui/icons-material/Reddit';
import Link from '@mui/material/Link';

// created function to handle API request
const fetcher = (...args) => fetch(...args).then((res) => res.json());

const flatten = (array) => {
    let result = [];
    array.forEach(function (a) {
      result.push(a);
      if (a.data.replies && a.data.replies.data && Array.isArray(a.data.replies.data.children)) {
        result = result.concat(flatten(a.data.replies.data.children));
      }
    });
    return result;
}

const formatValue = function(field, value) {
  let valueObj = {
    displayValue: value,
    sortValue: '',
    formattedValue: value
  };
  switch(field) {
    case 'durability':
      let totalDurability = 0;
      value.split(', ').forEach(dura => {
        if(dura.indexOf('x') > -1) {
          let countSplit = dura.split(' x');
          totalDurability += countSplit[0] * countSplit[1];
        } else {
          totalDurability += +dura;
        }
      });
      valueObj.sortValue = totalDurability.toString().padStart(4, '0');;
      break;
    case 'damage':
      valueObj.sortValue = '~' + value.replace('~', '').padStart(4, '0');
      break;
    case 'price':
      valueObj.formattedValue = +value.replace(',', '').replace('g', '');
      break;
    default:
      valueObj.sortValue = value;
      break;
  }

  return valueObj;
}

const formatRows = (keys, values) => {
  if(Array.isArray(values.at(0))) {
    return values.map(nestedRow => formatRow(keys, nestedRow));
  }

  return formatRow(keys, values);
}

const formatRow = (keys, values) => {
  return values.reduce((tableRow, value, index) => {
    const field = keys[index].toLowerCase();
    tableRow[field] = formatValue(field, value);
    return tableRow; 
  }, {});
}

const splitRowData = (rowString) => {
  const [...rowSplit] = rowString.split('|').filter(n => n);
  return rowSplit
}

const formatHeader = (header => {
  return {
    field: header.toLowerCase(),
    title: header
  };
});

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 400,
  maxWidth: '98vw',
  maxHeight: '80vh',
  overflow: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const KOTDShop = () => {

    // const sortOptions = [
    //   'type',
    //   'damage',
    //   'element',
    //   'durability'
    // ];
    
    // const [tableSort, setSort] = React.useState('type');
    const [filters, setFilter] = React.useState({
      type: {
        '⚔️': false,
        '🏹': false,
        '🔮': false,
        '🎆': false,
      },
      element: {
        Air: false,
        Blessed: false,
        Cursed: false,
        Earth: false,
        Fire: false,
        Moon: false,
        Organic: false,
        Sun: false,
        Synthetic: false,
        Water: false,
      }
    });

    const optionLabels = {
      Air: 'https://cdn.discordapp.com/emojis/1051333997323628564.webp?size=48&quality=lossless',
      Blessed: 'https://cdn.discordapp.com/emojis/1042933454708408350.webp?size=48&quality=lossless',
      Cursed: 'https://cdn.discordapp.com/emojis/1042933519703343304.webp?size=48&quality=lossless',
      Earth: 'https://cdn.discordapp.com/emojis/1051333985499885648.webp?size=48&quality=lossless',
      Fire: 'https://cdn.discordapp.com/emojis/1042933464594391151.webp?size=48&quality=lossless',
      Moon: 'https://cdn.discordapp.com/emojis/1042933456579072040.webp?size=48&quality=lossless',
      Organic: 'https://cdn.discordapp.com/emojis/1042933517727825980.webp?size=48&quality=lossless',
      Sun: 'https://cdn.discordapp.com/emojis/1042933458357461042.webp?size=48&quality=lossless',
      Synthetic: 'https://cdn.discordapp.com/emojis/1042933460475592765.webp?size=48&quality=lossless',
      Water: 'https://cdn.discordapp.com/emojis/1042933352770064394.webp?size=48&quality=lossless',
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
    
    const [cart, updateCart] = React.useState({});
    const [cartCheckout, checkoutCart] = React.useState([]);
    
    const addToCart = (row, qty) => {
      const inCart = Object.keys(cart).indexOf(row.id.displayValue) > -1;

      let itemQty = inCart ? cart[row.id.displayValue].qty += qty : 1;
      let itemCost = row.price.formattedValue;
      updateCart({
        ...cart,
        [row.id.displayValue]: {
          ...cart[row.id.displayValue],
          qty: itemQty,
          name: row.name.displayValue,
          totalCost: new Intl.NumberFormat().format(itemQty * itemCost),
          rawCost: itemQty * itemCost,
          row
        }
      });
    }

    const clearCart = () => {
      updateCart({});
      setCartModalOpen(false);
    }

    const [checkoutModalOpen, setCheckoutModalOpen] = React.useState(false);
    const [cartModalOpen, setCartModalOpen] = React.useState(false);

    const getCartItems = () => {
      const cartItems = Object.keys(cart).map(itemId => {
        let subItems = [];
        for(let c = 0; c < cart[itemId].qty; c++) {
          if(cart[itemId].name === 'Refill') {
            subItems.push('!refill ');
          } else {
            subItems.push('!buy ' + itemId)
          }
        }
        return subItems
      }).flat();

      return cartItems;
    }

    const openCart = () => {
      setCartModalOpen(true);
    }

    const checkout = () => {
      const cartItems = getCartItems();

      checkoutCart(chunkArray(cartItems, 10));
      setCheckoutModalOpen(true);
    }

    const completeCart = () => {
      clearCart();
      setCheckoutModalOpen(false);
    }

    const {
        data: res,
        error,
        isValidating,
      } = useSWR('https://api.reddit.com/api/info/?id=t3_167tvm4', fetcher, { revalidateOnFocus: false});
    
      // Handles error and loading state
      if (error) return <div className='failed'>failed to load</div>;
      if (isValidating) return <div className="Loading">Loading...</div>;
      let rawShop = res.data?.children?.length  ? flatten(res.data.children).map(rawComments => {
        return {
          body: rawComments.data.selftext,
          edited: rawComments.data.edited
        }
      })[0] : [];
      if(!rawShop.body) return <h3 style={{color: '#FFFFFF'}}>No recent Inventory Pulls on r/KickOpenTheDoor</h3>

      let inventoryTables = rawShop.body ? rawShop.body.split('\n\n').filter(table => { return table.indexOf('|Price|ID|') > -1}) : [];
      
      let lastPollSeconds = rawShop.edited;
      let lastPoll = new Date(lastPollSeconds*1000);
 
      if(!inventoryTables.length) return <h3 style={{color: '#FFFFFF'}}>No recent Inventory Pulls on r/KickOpenTheDoor</h3>

      let jsonInventory = inventoryTables.map((tableString, tableIndex) => {
        // eslint-disable-next-line no-unused-vars
        const [headerFields, splitterRow, ...rawTableRows] = tableString.split('\n').map((rowString, rIndex) => {
          let rowData;
          const nestCheck = rowString.indexOf('||') > -1;
          if(nestCheck) {
            const nestedRows = rowString.split('||').filter(n => n);
            rowData = nestedRows.map(splitRowData);
          } else {
            rowData = splitRowData(rowString);
          }
          const headerRow = [...new Set(rowData.flat())];

          return !rIndex ? headerRow : rowData;
        });

        const [firstValue] =  rawTableRows.flat();
        const isNestedTable = Array.isArray(firstValue);
        const flattenedRows = isNestedTable ? rawTableRows.flat() : rawTableRows;

        return {
          headers: headerFields.map(formatHeader),
          headerFields: headerFields.map(header => header.toLowerCase()),
          tableRows: flattenedRows.map(tableRow => formatRows(headerFields, tableRow)).flat(),
          title: ['Items', 'Canteen', 'Bundles'][tableIndex]
        };
      });

      return (
        <Container maxWidth="xl">
          <Stack sx={{position: 'fixed', right: 20, bottom: 20}}>
            <Fab sx={{color: '#FFF'}} >
              <Link href={"https://www.reddit.com/r/kickopenthedoor/comments/167tvm4/weapon_shop_trading_tavern/"} underline="none" target="_blank" rel="noreferrer" title={"Open KOTD Shop"} sx={{color: '#ff4500'}}>
                  <RedditIcon />
              </Link>
            </Fab>
            <Badge showZero={true} badgeContent={getCartItems().length} color="secondary" title={'Open Cart'}>
              <Fab color="primary" aria-label="Open Cart" onClick={() => openCart()} >
                <ShoppingCartIcon />
              </Fab>
            </Badge>
          </Stack>
          <h4 style={{color: '#FFFFFF'}}>Last Shop Update: <Moment fromNow>{lastPoll}</Moment></h4>
          {jsonInventory.map((table, tIndex) => (
            <div key={table.title+tIndex} style={{maxWidth: '100%', overflow: 'auto', color: '#FFFFFF'}}>
              <table className="inventorytable">
                <caption style={{color: '#FFFFFF'}}>
                  <h5>{table.title}</h5>
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
                    <th>+</th>
                    {table.headers.map((header, hIndex) => (
                      <th key={header.title+hIndex}>{header.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.tableRows.filter(row => {
                    if(!row.id || !row.name?.displayValue) return false;
                    const filterKeys = Object.keys(filters).filter(filterKey => row[filterKey]);
                    const filtersOn = filterKeys.map(filterKey => {
                      return Object.keys(filters[filterKey]).filter(filterIem => filters[filterKey][filterIem] );
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

                    return filtersCheck.every(v => v) && row.id.displayValue
                  }).map((row, rIndex) => (
                    <tr key={JSON.stringify(row) + rIndex}>
                      <td>
                        <IconButton color="secondary" aria-label="add to shopping cart" onClick={() => addToCart(row, 1)}>
                          <AddShoppingCartIcon />
                        </IconButton>
                      </td>
                      {table.headers.map((header, hrIndex) => (
                        <td key={JSON.stringify(row[header.field]) + hrIndex}>{
                          optionLabels[row[header.field]?.displayValue] ? <img src={optionLabels[row[header.field]?.displayValue]} alt={row[header.field]?.displayValue} style={{backgroundSize: 24, height: 24, width: 24}}/>
                            : row[header.field]?.displayValue}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <Modal
            open={checkoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              <h3>You will need {cartCheckout.length} comment{cartCheckout.length > 1 ? 's' : ''} to complete this order!</h3>
              <hr />
              {cartCheckout.map((cartGroup, groupIndex) => (
                <div key={groupIndex}>
                  <h5 style={{margin: 0}}>Comment {groupIndex+1} <CopyToClipboardButton text={cartGroup.join(' ')} /></h5>
                  <p>{cartGroup.join(' ')}</p>
                  <hr/>
                </div>
              ))}
              <ButtonGroup variant="contained" aria-label="Edit Cart Item Qty">
                <Button color="primary" variant="outlined"href="https://www.reddit.com/r/kickopenthedoor/comments/167tvm4/weapon_shop_trading_tavern/" target="_blank" title={'Open KOTD Shop'}>
                  <RedditIcon  sx={{color: '#ff4500'}}/>
                </Button>
                <Button variant="contained" color="primary" aria-label="Complete Cart" onClick={() => completeCart()} startIcon={<TaskAltIcon />}>
                  Mark Complete
                </Button>
              </ButtonGroup>
            </Box>
          </Modal>
          <Modal
            open={cartModalOpen}
            onClose={() => setCartModalOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={modalStyle}>
              {Object.keys(cart).filter(itemId => cart[itemId].qty).length ? 
                  <table className="cart" style={{ width: '100%'}} id="cart">
                  <caption><h3>Cart</h3></caption>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                  {Object.keys(cart).sort().filter(itemId => cart[itemId].qty).map(itemId => (
                    <tr key={JSON.stringify(cart[itemId])}>
                      <td>
                        <ButtonGroup variant="contained" aria-label="Edit Cart Item Qty">
                          <IconButton color="secondary" aria-label="remove from cart" onClick={() => addToCart(cart[itemId].row, -cart[itemId].qty)} title={'Delete Row'}>
                            <DeleteIcon />
                          </IconButton>
                          <IconButton color="primary" aria-label="remove 1 rom cart" onClick={() => addToCart(cart[itemId].row, -1)} title={'Remove 1'}>
                            <RemoveIcon />
                          </IconButton>
                          <IconButton color="primary" aria-label="add to shopping cart" onClick={() => addToCart(cart[itemId].row, 1)} title={'Add 1'}>
                            <AddIcon />
                          </IconButton>
                        </ButtonGroup>
                      </td>
                      <td align='center'>{cart[itemId].name}</td>
                      <td align='center'>
                        {cart[itemId].qty}
                      </td>
                      <td align='center'>{cart[itemId].totalCost}g</td>
                    </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} align="right">Total Cost</td>
                      <td>{new Intl.NumberFormat().format(Object.keys(cart).map(itemId => cart[itemId].rawCost).reduce((partialSum, a) => partialSum + a, 0))}g</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{textAlign: 'right'}}>
                        <ButtonGroup variant="contained" aria-label="Edit Cart Item Qty">
                          <Button variant="outlined" color="secondary" aria-label="Clear Cart" onClick={() => clearCart()} startIcon={<RemoveShoppingCartIcon />}>
                            Clear Cart
                          </Button>
                          <Button variant="contained" color="primary" aria-label="Checkout" onClick={() => checkout()} startIcon={<ShoppingCartCheckoutIcon />}>
                            Checkout
                          </Button>
                        </ButtonGroup>
                    </td>
                    </tr>
                  </tfoot>
                </table> : <h3>Your cart is empty</h3>
                }
            </Box>
          </Modal>
        </Container>
      );
};

export { KOTDShop };