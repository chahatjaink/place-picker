import { useCallback, useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

const localStorageKey = 'pickedPlaces';
const storedIds = JSON.parse(localStorage.getItem(localStorageKey)) || [];
const storedPlaces = storedIds.map((id) => AVAILABLE_PLACES.find((place) => place.id === id));

function App() {
  const selectedPlace = useRef();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  const [sortedPlaces, setSortedPlaces] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, latitude, longitude);
      setSortedPlaces(sortedPlaces);
    })
  })

  function handleStartRemovePlace(id) {
    setIsModalOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsModalOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storedIds = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    if (storedIds.indexOf(id) === -1)
      localStorage.setItem(localStorageKey, JSON.stringify([...storedIds, id]));
  }

  const handleRemovePlace = useCallback(function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setIsModalOpen(false);

    const storedIds = JSON.parse(localStorage.getItem(localStorageKey)) || [];
    localStorage.setItem(localStorageKey, JSON.stringify(storedIds.filter((id) => id !== selectedPlace.current)));
  }, [])

  return (
    <>
      <Modal open={isModalOpen} onClose={handleStopRemovePlace}>
        {isModalOpen && <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />}
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={sortedPlaces}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
