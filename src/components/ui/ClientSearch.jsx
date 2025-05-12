// src/components/sales/ClientSearch.jsx
import { useState, useEffect } from 'react'
import { Autocomplete, TextField, Box, Typography } from '@mui/material'
import clientService from '../../services/clientService'

function ClientSearch({ value, onChange }) {
  const [options, setOptions] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (inputValue.length > 2) {
      setLoading(true)
      clientService.searchClients(inputValue)
        .then(clients => {
          setOptions(clients)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setOptions([])
    }
  }, [inputValue])

  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={(_, newValue) => {
        console.log('Selected client:', newValue)
        onChange(newValue)
      }}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        console.log('Input changed:', newInputValue)
        setInputValue(newInputValue)
      }}
      getOptionLabel={(option) => option ? `${option.ci_nit} - ${option.full_name}` : ''}
      isOptionEqualToValue={(option, value) => option?.client_id === value?.client_id}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.client_id}>
          <Box>
            <Typography>{option.full_name}</Typography>
            <Typography variant="body2" color="text.secondary">
              CI/NIT: {option.ci_nit}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Buscar cliente por CI/NIT o nombre"
          placeholder="Ingrese CI/NIT o nombre del cliente"
          fullWidth
        />
      )}
      loading={loading}
      noOptionsText={inputValue.length > 2 ? "No se encontraron clientes" : "Ingrese al menos 3 caracteres"}
    />
  )
}

export default ClientSearch