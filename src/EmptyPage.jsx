import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {Line} from "react-chartjs-2";

// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EmptyPage = () => {
    const { id } = useParams(); // Get the selected map id
    const [mapDetails, setMapDetails] = useState(null);

    useEffect(() => {
        // Fetch map details using the id
        axios.get(`http://localhost:8080/map/${id}`)
            .then(response => {
                setMapDetails(response.data); // Store the details in state
            })
            .catch(error => {
                console.error('Error fetching map details:', error);
            });
    }, [id]);

    if (!mapDetails) {
        return <div>Loading...</div>; // Show loading until data is fetched
    }

    const calculatePolynomial = (x) => {

        try {
            // Convert string expression into a valid JavaScript expression using eval
            return eval(mapDetails.root_function);

        } catch (error) {
            console.error("Error evaluating expression:", error);
        }

    };

    const xValues = Array.from({ length: 21 }, (_, i) => i );
    const yValues = xValues.map((x) => calculatePolynomial(x));

    const highlightedX = 6;
    const highlightedY = calculatePolynomial(highlightedX);

    const data = {
        labels: xValues,
        datasets: [
            {
                label: mapDetails.root_function, // Use formatted expression as label
                data: yValues,
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                fill: false,
            },
            {
                label: `Highlight at x = ${highlightedX}`,
                data: xValues.map((x) => (x === highlightedX ? highlightedY : null)), // Only show the point at x = 4
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 1)",
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false, // Only show the point, not a line
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Polynomial Graph\n${mapDetails.root_function}`, // Use formatted expression as title
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "x",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "y",
                },
            },
        },
    };

    return (
        <div style={{ width: "1000px", height: "600px" }}>
            <Line data={data} options={options} />
        </div>
    );

    // return (
    //     <div>
    //         <h1>Map Details</h1>
    //         <p>Map ID: {mapDetails.root_id}</p>
    //         <p>Starting X: {mapDetails.starting_x}</p>
    //         <p>Ending X: {mapDetails.ending_x}</p>
    //         <p>Root Function: {mapDetails.root_function}</p>
    //     </div>
    // );
};

export default EmptyPage;
