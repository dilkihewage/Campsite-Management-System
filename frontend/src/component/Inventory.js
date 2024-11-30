import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Import jsPDF
import Navigation from './NavigationInventory';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap'; // Import Bootstrap components including Alert
import { Bar } from 'react-chartjs-2'; // Import Bar chart from react-chartjs-2
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import 'jspdf-autotable';
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item for updating
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [showChart, setShowChart] = useState(false); // State to toggle chart visibility

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:5000/inventory');
        setInventoryItems(response.data);
      } catch (error) {
        setError('Error fetching inventory items');
        console.error('Error fetching inventory items:', error);
      }
    };

    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5000/inventory/${id}`);
        setInventoryItems(prevItems => prevItems.filter(item => item._id !== id));
      } catch (error) {
        setError('Error deleting item');
        console.error('Error deleting item:', error);
      }
    }
  };

  const generateReport = () => {
    // Implementation of the PDF report (omitted for brevity)
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (selectedItem) {
      try {
        await axios.put(`http://localhost:5000/inventory/${selectedItem._id}`, selectedItem);
        setInventoryItems(prevItems =>
          prevItems.map(item => (item._id === selectedItem._id ? selectedItem : item))
        );
        setShowModal(false); // Close modal
        setSelectedItem(null); // Reset selected item
      } catch (error) {
        setError('Error updating item');
        console.error('Error updating item:', error);
      }
    }
  };

  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="text-center">Inventory Management</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Search by item name, SKU, category, or supplier"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Supplier</th>
            <th>Reorder Level</th>
            <th>Date Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map(item => (
            <tr key={item._id}>
              <td>{item.itemName || 'Unnamed Item'}</td>
              <td>{item.sku || 'N/A'}</td>
              <td>{item.category || 'N/A'}</td>
              <td>
                {item.quantity !== undefined ? item.quantity : 'N/A'}
                {/* Display reorder alert if quantity is less than 4 */}
                {item.quantity < 4 && (
                  <Alert variant="warning" className="mt-2">
                    Low stock! Please reorder.
                  </Alert>
                )}
              </td>
              <td>{`$${(typeof item.price === 'number' ? item.price.toFixed(2) : '0.00')}`}</td>
              <td>{item.supplier || 'N/A'}</td>
              <td>{item.reorderLevel !== undefined ? item.reorderLevel : 'N/A'}</td>
              <td>{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'}</td>
              <td>
                <Button variant="primary" size="sm">Update</Button>
                <Button variant="danger" size="sm" className="ml-2">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
