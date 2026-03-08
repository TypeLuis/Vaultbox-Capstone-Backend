// import React from 'react';
import { useAuth } from '../context/authcontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiCreateDevice, apiFetchDevices } from '../utilities/functions/ApiFunctions';
import { selfHosted } from '../utilities/functions/configFunctions';
import { useEffect, useState } from 'react';
import type { Device } from '../utilities/types/types';
import DeviceCard from '../components/DeviceCard';

type DashboardProps = {

}

const Dashboard = ({ }: DashboardProps) => {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const { logout, token } = useAuth()
  const nav = useNavigate()


  // const createDevice = () => apiCreateDevice(token, selfHosted ? "yes" : "no")

  function handleLogout() {
    logout()
    nav('/auth')
  }

  async function loadDevices() {
    try {
      setLoading(true);
      const data = await apiFetchDevices(token);
      setDevices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function createDevice() {
    try {
      setLoading(true);

      const created = await apiCreateDevice(token, selfHosted ? "yes" : "no");
      console.log(created);

      setDevices((prev) => [created, ...prev]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetData() {
    try {
      let res = await axios.get("/api/auth", {
        headers: { "x-auth-token": token }
      }) // Get user info with id and auth token
      console.log(res.data)
    } catch (error) {

    }
  }

  useEffect(() => {

    void loadDevices()
  }, [])


  return (
    <>
      Testing
      <button onClick={handleLogout}>Logout</button>
      <button onClick={handleGetData}>Get Data</button>
      <button onClick={createDevice}>Get Device Data</button>
      {devices.length > 0 && devices.map((el) => {
        return <DeviceCard key={el._id} device={el} />
      })}
    </>
  );
};

export default Dashboard;