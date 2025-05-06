import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AnimalList = () => {
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/animals')
      .then(res => setAnimals(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <ul>
      {animals.map(animal => <li key={animal._id}>{animal.name}</li>)}
    </ul>
  );
};

export default AnimalList;