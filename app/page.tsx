"use client";

import React, { useState, useEffect } from "react";

export default function DogsCRUD() {
  const [dogs, setDogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentDog, setCurrentDog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dogToDelete, setDogToDelete] = useState(null);
  const [searchId, setSearchId] = useState("");
  const [filteredDogs, setFilteredDogs] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const initialFormState = {
    idDog: "",
    name: "",
    breed: "",
    birth_date: "",
    gender: "",
    owner: "",
    phone: "",
  };

  function calculateHumanAge(birthDateStr) {
    const birthDate = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  function calculateDogAge(humanAge) {
    if (humanAge === 1) return 15;
    if (humanAge === 2) return 24;
    if (humanAge >= 3) return 24 + (humanAge - 2) * 4;
    return 0;
  }


  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    fetchDogs();
  }, []);

  const handleSearch = () => {
    if (searchId.trim() === "") {
      setIsSearchActive(false);
      setFilteredDogs([]);
      return;
    }

    const result = dogs.filter((dog) => (dog.idDog === searchId.trim() || dog.name === searchId.trim() || dog.owner === searchId.trim()));
    setFilteredDogs(result);
    setIsSearchActive(true);
  };


  const fetchDogs = async () => {
    try {
      const res = await fetch("https://apiveterinaria-eche.onrender.com/veterinary/dogs");
      const data = await res.json();

      const processedData = data.map((dog) => {
        const humanAge = calculateHumanAge(dog.birth_date);
        const dogAge = calculateDogAge(humanAge);
        return {
          ...dog,
          human_age: humanAge,
          dog_age: dogAge
        };
      });

      setDogs(processedData);
    } catch (error) {
      console.error("Failed to fetch dogs:", error);
    }
  };


  const openCreateModal = () => {
    setForm(initialFormState);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (dog) => {
    setForm({
      ...dog,
      birth_date: dog.birth_date?.split("T")[0],
    });
    setCurrentDog(dog);
    setModalMode("edit");
    setShowModal(true);
  };

  const openDeleteModal = (dog) => {
    setDogToDelete(dog);
    setShowDeleteModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.breed || !form.birth_date || !form.idDog || !form.gender || !form.owner || !form.phone) {
      alert("Please fill the form completely.");
      return;
    }

    try {
      let url = "";
      let method = "";
      if(modalMode === "create") {
       url = "https://apiveterinaria-eche.onrender.com/veterinary/dog";
       method = "POST";  
      }else {
       url = `https://apiveterinaria-eche.onrender.com/veterinary/dog/${currentDog._id}`;
       method = "PUT";
      }

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      fetchDogs();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving dog:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`https://apiveterinaria-eche.onrender.com/veterinary/dog/${dogToDelete._id}`, {
        method: "DELETE",
      });
      fetchDogs();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting dog:", error);
    }
  };

  return (
    <>
    <div>
      <h2>Dogs CRUD</h2><br />

      <div>
        <label>Search by ID, dog name, or owner name </label><br />
        <input type="text" placeholder="Search...." value={searchId} onChange={(e) => setSearchId(e.target.value)}/>
        <button onClick={handleSearch}>Search</button>
        <button onClick={() => {setSearchId(""); setFilteredDogs([]); setIsSearchActive(false);}}>Clear</button>
        <button onClick={openCreateModal}>Add Dog</button>
      </div>
      <br />

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Breed</th>
            <th>Birth Date</th>
            <th>Human Age</th>
            <th>Dog Age</th>
            <th>Gender</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(isSearchActive ? filteredDogs : dogs).length === 0 ? (
            <tr>
              <td colSpan={10}>No dogs found.</td>
            </tr>
          ) : (
            (isSearchActive ? filteredDogs : dogs).map((dog) => (
              <tr key={dog._id}>
                <td>{dog.idDog}</td>
                <td>{dog.name}</td>
                <td>{dog.breed}</td>
                <td>{dog.birth_date?.split("T")[0]}</td>
                <td>{dog.human_age}</td>
                <td>{dog.dog_age}</td>
                <td>{dog.gender}</td>
                <td>{dog.owner}</td>
                <td>{dog.phone}</td>
                <td>
                  <button onClick={() => openEditModal(dog)}>Edit</button>{" "}
                  <button onClick={() => openDeleteModal(dog)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{modalMode === "create" ? "Add Dog" : "Edit Dog"}</h3>
            <form onSubmit={handleSubmit}>
              <label>IdDog: </label> 
              <input name="idDog" value={form.idDog} onChange={handleChange}required/><br/>
              <label>Dog name: </label> 
              <input name="name" value={form.name} onChange={handleChange} required /><br />
              <label>Dog Breed: </label> 
              <input name="breed" value={form.breed} onChange={handleChange}required /><br />
              <label>Dog birth date: </label> 
              <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} required /><br />
              <label>Dog gender: </label> 
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">--Select Gender--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select><br />
              <label>Owner: </label> 
              <input name="owner" value={form.owner} onChange={handleChange} required/><br />
              <label>Owner phone: </label> 
              <input name="phone" value={form.phone} onChange={handleChange} required /><br />
              <button type="submit">{modalMode === "create" ? "Add" : "Save"}</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <p>Are you sure you want to delete <strong>{dogToDelete.name}</strong>?</p>
            <button onClick={handleDelete}>Yes, Delete</button>
            <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
