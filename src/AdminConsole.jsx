import React, { useState } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";

const AdminConsole = ({ handleRestart }) => {
    const [rootIdInput, setRootIdInput] = useState(""); // Input for root ID
    const [rootEntity, setRootEntity] = useState({
        root_id: "",
        starting_x: "",
        ending_x: "",
        root_function: "",
    }); // Editable root entity state
    const [isAddingNew, setIsAddingNew] = useState(false); // State for adding new root entity
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch data for the given root ID
    const fetchRootEntity = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`http://localhost:8080/add-route/${rootIdInput}`);
            setRootEntity(response.data);
            setIsAddingNew(false); // Reset adding new state
        } catch (err) {
            setError("Failed to fetch the root entity.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setRootIdInput(e.target.value);
    };

    const handleSearch = () => {
        if (rootIdInput.trim()) {
            fetchRootEntity();
        } else {
            setError("Please enter a valid root ID.");
        }
    };

    // Handle form input changes for editable fields
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setRootEntity((prevEntity) => ({
            ...prevEntity,
            [name]: value,
        }));
    };

    // Handle form submission to update the root entity or add a new one
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const url = isAddingNew
                ? 'http://localhost:8080/add-route' // Add new entity URL
                : `http://localhost:8080/add-route/${rootEntity.root_id}`; // Update existing entity URL

            const response = await fetch(url, {
                method: isAddingNew ? 'POST' : 'PUT', // POST for new, PUT for update
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rootEntity),
            });

            if (response.ok) {
                const result = await response.json();
                alert(isAddingNew ? 'Root entity added successfully!' : 'Root entity updated successfully!');
                console.log(result);
                setIsAddingNew(false); // Reset the adding new state after submission
            } else {
                alert(isAddingNew ? 'Failed to add root entity' : 'Failed to update root entity');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(isAddingNew ? 'Error adding root entity' : 'Error updating root entity');
        }
    };

    // Handle deletion of the root entity
    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this entity?")) {
            try {
                const response = await axios.delete(`http://localhost:8080/add-route/${rootEntity.root_id}`);
                if (response.status === 200) {
                    alert('Root entity deleted successfully!');
                    setRootEntity({
                        root_id: "",
                        starting_x: "",
                        ending_x: "",
                        root_function: "",
                    });
                    setRootIdInput("");
                } else {
                    alert('Failed to delete the root entity.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting root entity');
            }
        }
    };

    // Handle click of the "Add new" button to prepare the form for a new entity
    const handleAddNew = () => {
        setRootEntity({
            root_id: "",
            starting_x: "",
            ending_x: "",
            root_function: "",
        });
        setIsAddingNew(true); // Enable adding new state
        setError(null); // Clear any previous errors
    };

    const updateDefaultTestData = async () => {
        try {
            const response = await axios.post('http://localhost:8080/update-default-test-data');
            const message = response.data;
            alert(`Success: ${message}`);
        } catch (error) {
            console.error('Error updating test data:', error);
            alert('Failed to update test data');
        }
    };

    return (
        <div>
            <button onClick={async () => {
                try {
                    await updateDefaultTestData();
                    await handleRestart();
                } catch (error) {
                    console.error('Error in updating and restarting:', error);
                }
            }}>Update default test data
            </button>

            <div className="content">
                <h2>Admin Console</h2>
                {/* The rest of your content goes here */}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter root ID"
                    value={rootIdInput}
                    onChange={handleInputChange}
                />
                <button onClick={handleSearch}>Search</button>
                <button onClick={handleAddNew} style={{marginLeft: "10px"}}>Add new</button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {(rootEntity.root_id || isAddingNew) && (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Root ID:</label>
                        <input
                            type="text"
                            name="root_id"
                            value={rootEntity.root_id}
                            onChange={handleFieldChange}
                            disabled={!isAddingNew} // Disable only when editing an existing entity
                        />
                    </div>
                    <div>
                        <label>Starting X:</label>
                        <input
                            type="text"
                            name="starting_x"
                            value={rootEntity.starting_x}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div>
                        <label>Ending X:</label>
                        <input
                            type="text"
                            name="ending_x"
                            value={rootEntity.ending_x}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div>
                        <label>Root Function:</label>
                        <input
                            type="text"
                            name="root_function"
                            value={rootEntity.root_function}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <button type="submit">{isAddingNew ? 'Add' : 'Update'}</button>
                    {!isAddingNew && (
                        <button type="button" onClick={handleDelete}
                                style={{marginLeft: "10px", backgroundColor: "red", color: "white"}}>
                            Delete
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};

export default AdminConsole;
