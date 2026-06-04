import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  Card,
  Box,
  Autocomplete,
  Chip,
  Avatar,
  CircularProgress,
  IconButton,
} from '@mui/joy';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase/firebase';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

const UserDropdownActivity = () => {
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState(null);         // selected user object
  const [inputValue, setInputValue] = useState(''); // search text
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser?.uid;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/active_users', { params: { uid: currentUser } });
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser]);

  const options = useMemo(() => {
    return users.map((u) => {
      const label = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
      return {
        ...u,
        _label: label,
        _search: [u.first_name, u.last_name, u.email].filter(Boolean).join(' ').toLowerCase(),
      };
    });
  }, [users]);

  const filtered = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o._search.includes(q));
  }, [options, inputValue]);

  const handleChange = (_e, newUser) => {
    setValue(newUser);
    if (newUser) {
      const encodedName = encodeURIComponent(newUser._label);
      navigate(`/activity/user/${encodedName}?tab=all`);
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setValue(null);
  };

  return (
    <Card
      variant="outlined"
      sx={{
        // width: '100%',
        p: 2.5,
        mt: 2,
        borderRadius: 'xl',
        boxShadow: 'sm',
        borderColor: 'neutral.outlinedBorder',
      }}
    >
      <Typography level="h4" sx={{ mb: 1 }}>
        View User Activity
      </Typography>
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.tertiary' }}>
        Search by name or email, then select a user to open their activity.
      </Typography>

      <Box>
        <Autocomplete
          size="lg"
          placeholder={loading ? 'Loading users…' : 'Search or select a user'}
          loading={loading}
          options={filtered}
          value={value}
          onChange={handleChange}
          inputValue={inputValue}
          onInputChange={(_e, v) => setInputValue(v)}
          getOptionLabel={(o) => o?._label ?? ''}
          isOptionEqualToValue={(o, v) => o?.id === v?.id}
          noOptionsText={inputValue ? 'No matches found' : 'No users available'}
          startDecorator={<SearchRoundedIcon />}
          endDecorator={
            inputValue || value ? (
              <IconButton
                variant="plain"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                aria-label="Clear"
              >
                <CloseRoundedIcon />
              </IconButton>
            ) : null
          }
          renderOption={(props, option) => (
            <li
              {...props}
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 12,
                cursor:"pointer"
              }}
            >
              <Avatar size="sm">{getInitials(option._label)}</Avatar>
              <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography level="body-md">{option._label}</Typography>
                </div>
                {option.email ? (
                  <Chip
                    size="sm"
                    variant="soft"
                    sx={{ ml: 'auto', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {option.email}
                  </Chip>
                ) : null}
              </div>
            </li>
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option.id}
                variant="soft"
                size="sm"
              >
                {option._label}
              </Chip>
            ))
          }
          multiple={false}
          clearOnBlur={false}
          freeSolo={false}
          slotProps={{
            root: {
              sx: {
                '--Autocomplete-paddingInline': '12px',
                '--ListItem-radius': '12px',
                '--ListItemDecorator-size': '28px',
              },
            },
            listbox: {
              sx: {
                maxHeight: 360,
                overflowY: 'auto',
                p: 0.5,
                borderRadius: 'lg',
                boxShadow: 'md',
                border: '1px solid',
                borderColor: 'neutral.outlinedBorder',
                bgcolor: 'background.surface',
              },
            },
            input: {
              sx: {
                py: 1.25,
              },
            },
            popupIndicator: {
              sx: { mr: 0.5 },
            },
          }}
          sx={{
            width: '100%',
            borderRadius: 'xl',
            boxShadow: 'sm',
            '--Input-radius': 'xl',
            '--Input-minHeight': '44px',
          }}
        />

        {loading && (
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size="sm" />
            <Typography level="body-sm" color="neutral">
              Fetching users…
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default UserDropdownActivity;
