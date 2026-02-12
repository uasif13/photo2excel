'use client'

import React, {useState} from 'react';
import { createWorker } from 'tesseract.js';

const ImageUploader = () => {
    const [selectedImages, setSelectedImages] = useState([]);
    const [ocrResults, setOcrResults] = useState([]);
    const [ocrStatus, setOcrStatus] = useState('');
    const [json, setJson] = useState({});

    const handleImageUpload = async (event) => {
        setOcrResults([]);
        setOcrStatus('');
        for (const file of event.target.files) {
            setSelectedImages(prev => [...prev, file]);
        }
    }
    const readImageText = async () => {
        console.log("inside")
        if (selectedImages.length === 0) {
            return;
        }
        if (selectedImages.length%2 !== 0) {
            setOcrStatus('Please upload an even number of images');
            return;
        }
        setOcrStatus('Processing...');

        const worker = await createWorker('eng', 1, {
            logger: m => console.log(m)
        })

        try {
            const results = [];
            for (const image of selectedImages) {
                const {
                    data: {text},
                } = await worker.recognize(image);
                results.push(text);
            }
            
            // Update ocrResults state
            setOcrResults(results);
            
            // Build JSON from local results array
            const newJson = {};
            for (let i = 0; i < results.length; i += 2) {
                newJson[results[i]] = results[i + 1];
                console.log("updated Value", {[results[i]]: results[i + 1]});
            }
            setJson(newJson);
            
            setOcrStatus('completed');
        } catch (error) {
            console.error (error);
            setOcrStatus('Error occurred during processing');
        } finally {
            await worker.terminate();
        }
        
    }

    const downloadCSV = async () => {
        try {
            const response = await fetch('/api/download-csv', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(json),
            });

            if (!response.ok) {
                throw new Error('Failed to generate CSV');
            }

            // Create a download link from the response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'output.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log('CSV file downloaded successfully');
        } catch (error) {
            console.error('Error downloading CSV file', error);
        }
    }

    return (
        <div>
            <div>
                <input type='file' accept='image/*' onChange={handleImageUpload} multiple />
            </div>
        {selectedImages && selectedImages.length > 0 && selectedImages.map((image, index) => (
            <img
                src={URL.createObjectURL(image)}
                alt='Uploaded content'
                width = {350}
                style={{marginTop: 15}}
                key={index}
            />
        ))}
        <div style={{marginTop: 15}}>
            <button
                onClick = {readImageText}
                style={{
                    background: '#FFFFFF',
                    borderRadius: 7,
                    color: '#000000',
                    padding: 5
                }}
                >
                    Submit
                </button>
        </div>

        <p style={{marginTop: 20, fontWeight: 700}}>Status:</p>
        <p>{ocrStatus}</p>
        <h3 style={{marginTop:10, fontWeight: 700}}>Extracted Text:</h3>
        <p
            dangerouslySetInnerHTML={{
                __html: ocrResults.join('\n').replace(/\n/g, '<br/>').replace(/[=,_,-,+]/g, ' '),
            }}
            style={{
                border: '1px solid white',
                width: 'fit-content',
                padding: 10,
                marginTop: 10,
                borderRadius: 10,
            }}
            />
        <h3 style={{marginTop:10, fontWeight: 700}}>Extracted JSON:</h3>
        <p
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(json).replace(/\n/g, '<br/>').replace(/[=,_,-,+]/g, ' '),
            }}
            style={{
                border: '1px solid white',
                width: 'fit-content',
                padding: 10,
                marginTop: 10,
                borderRadius: 10,
            }}
            />
        <div style={{marginTop: 15}}>
            <button
                onClick = {downloadCSV}
                style={{
                    background: '#FFFFFF',
                    borderRadius: 7,
                    color: '#000000',
                    padding: 5
                }}
                >
                    Download CSV
                </button>
        </div>
        </div>
    )
}

export default ImageUploader;