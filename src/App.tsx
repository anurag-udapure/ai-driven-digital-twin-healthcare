import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar, NavigationPage } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { RiskPredictionPage } from './pages/RiskPredictionPage';
import { AlertsPage } from './pages/AlertsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { SimulationCenterPage } from './pages/SimulationCenterPage';
import { simulationService } from './services/simulationService';
import { INITIAL_ALERTS, MIMIC_PATIENTS } from './data/mimicData';
import { Patient, VitalHistoryPoint, DigitalTwinState, AlertEvent } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [patient, setPatient] = useState<Patient>(simulationService.getSelectedPatient());
  const [currentVital, setCurrentVital] = useState<VitalHistoryPoint>(simulationService.getCurrentSnapshot().currentVital);
  const [history, setHistory] = useState<VitalHistoryPoint[]>(simulationService.getCurrentSnapshot().history);
  const [twinState, setTwinState] = useState<DigitalTwinState>(simulationService.getCurrentSnapshot().twinState);
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(simulationService.isSimulationRunning());
  const [speed, setSpeed] = useState<number>(simulationService.getSpeed());
  const [mode, setMode] = useState<any>(simulationService.getMode());
  const [alerts, setAlerts] = useState<AlertEvent[]>(INITIAL_ALERTS);

  // Subscribe to simulation stream
  useEffect(() => {
    const unsubscribe = simulationService.subscribe(data => {
      setPatient(data.patient);
      setCurrentVital(data.currentVital);
      setHistory(data.history);
      setTwinState(data.twinState);
      setIsSimulationRunning(simulationService.isSimulationRunning());
      setSpeed(simulationService.getSpeed());

      if (data.newAlert) {
        setAlerts(prev => {
          // Avoid exact duplicate alerts
          if (prev.some(a => a.id === data.newAlert!.id)) return prev;
          return [data.newAlert!, ...prev];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelectPatient = useCallback((patientId: number) => {
    simulationService.setPatient(patientId);
    const selected = MIMIC_PATIENTS.find(p => p.stay_id === patientId || p.subject_id === patientId);
    if (selected) setPatient(selected);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (simulationService.isSimulationRunning()) {
      simulationService.pause();
      setIsSimulationRunning(false);
    } else {
      simulationService.start();
      setIsSimulationRunning(true);
    }
  }, []);

  const handleReset = useCallback(() => {
    simulationService.reset();
  }, []);

  const handleSpeedChange = useCallback((newSpeed: 0.5 | 1 | 2 | 5 | 10) => {
    simulationService.setSpeed(newSpeed);
    setSpeed(newSpeed);
  }, []);

  const handleModeChange = useCallback((newMode: any) => {
    simulationService.setMode(newMode);
    setMode(newMode);
  }, []);

  const handleAcknowledgeAlert = useCallback((alertId: string, notes?: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'acknowledged', acknowledgedAt: new Date().toISOString(), notes: notes || a.notes }
          : a
      )
    );
  }, []);

  const handleResolveAlert = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  }, []);

  const activeAlertCount = alerts.filter(a => a.status === 'active' && a.severity === 'critical').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 antialiased font-sans">
      {/* Persistent Left Navy Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Content Area with Sticky Header */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Sticky Header */}
        <Header
          currentPatient={patient}
          onSelectPatient={handleSelectPatient}
          isSimulationRunning={isSimulationRunning}
          simulatedTime={currentVital.simulatedTime || patient.intime}
          speed={speed}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {currentPage === 'dashboard' && (
            <DashboardPage
              patient={patient}
              currentVital={currentVital}
              history={history}
              twinState={twinState}
              alerts={alerts}
              isSimulationRunning={isSimulationRunning}
              speed={speed}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
              onNavigateTo={setCurrentPage}
            />
          )}

          {currentPage === 'live_monitoring' && (
            <LiveMonitoringPage
              patient={patient}
              currentVital={currentVital}
              history={history}
              twinState={twinState}
              isSimulationRunning={isSimulationRunning}
              speed={speed}
              mode={mode}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
              onModeChange={handleModeChange}
            />
          )}

          {currentPage === 'digital_twin' && (
            <DigitalTwinPage
              patient={patient}
              currentVital={currentVital}
              twinState={twinState}
              onNavigateTo={setCurrentPage}
            />
          )}

          {currentPage === 'risk_prediction' && (
            <RiskPredictionPage
              patient={patient}
              currentVital={currentVital}
              history={history}
            />
          )}

          {currentPage === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              patients={MIMIC_PATIENTS}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onResolveAlert={handleResolveAlert}
            />
          )}

          {currentPage === 'patient_history' && (
            <PatientHistoryPage
              selectedPatient={patient}
              onSelectPatient={handleSelectPatient}
            />
          )}

          {currentPage === 'simulation_center' && (
            <SimulationCenterPage
              patient={patient}
              currentVital={currentVital}
              history={history}
              twinState={twinState}
              isSimulationRunning={isSimulationRunning}
              speed={speed}
              mode={mode}
              onTogglePlay={handleTogglePlay}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
              onModeChange={handleModeChange}
              onSelectPatient={handleSelectPatient}
            />
          )}
        </main>
      </div>
    </div>
  );
}
