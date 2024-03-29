import React, { useState, useCallback} from 'react';
import debounce from 'lodash.debounce';
import { List,ListItem,ListItemButton,ListItemIcon } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert, setLocation } from '../redux/actions'
import { API_KEY } from '../api/globals';
export default function AutocompleteComp()
{
    const [inputValue, setInputValue] = useState('');
    const [options,setOptions] = useState([])
    const favorites = useSelector(state=> state.favoritesReducer)
    const dispatch = useDispatch()

    const debouncedSave = useCallback(
        debounce((newValue) =>{
            fetch("https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey="+API_KEY+"&q="+newValue)
            .then(res=> res.json())
            .then(res=>setOptions(res))
            .catch(err=>console.log(err))
        }, 1000),
        []
    );

    const updateValue = (newValue) => {
        setInputValue(newValue);
        debouncedSave(newValue);
    };

    const selectOption = (idx) => {
        setInputValue(options[idx].LocalizedName,options[idx].Key)
        dispatch(setLocation({name:options[idx].LocalizedName,key:options[idx].Key}))
        setOptions([])
    }

    const validateInput=(input)=> {
        if(!/^[a-zA-Z ]+$/.test(input) && input!=='')
            dispatch(setAlert({severity:"error", message:"Only english letters"}))
        else updateValue(input)
    }


    return (
        <div>
            <form style={{marginBottom:'0px'}}>
                <span className='autocompleteSearchIcon'><SearchIcon style={{fontSize:'28px'}}>
                    </SearchIcon>
                </span>
                <input 
                className='autocompleteInput'
                value={inputValue}
                placeholder={'Search location...'}
                onChange={(input) => validateInput(input.target.value)}
                />
            </form>

        {
          options.length>0 && 
            <List style={{position:'absolute', background:'white'}}>
                {options.map((value,idx)=> 
                <ListItem key={idx}>
                    <ListItemButton key={value.Key} 
                        onClick={()=> selectOption(idx)}>
                        {
                        favorites.some(x=>x.key===value.Key) ? 
                            <ListItemIcon>
                                <FavoriteIcon color='red'/>
                            </ListItemIcon> : ''
                        }
                        {value.LocalizedName}
                    </ListItemButton>
                </ListItem>
                )}
            </List>
        }
        </div>
    );
}