// js/data-manager.js - Shared data management between pages
class DataManager {
    constructor() {
        this.storageKey = 'rt-detect-live-data';
        this.listeners = [];
        this.init();
    }

    init() {
        // Listen for storage changes (cross-tab communication)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.notifyListeners();
            }
        });

        // Listen for page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.notifyListeners();
            }
        });
    }

    // Get live detection data
    getLiveData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : this.getDefaultData();
        } catch (error) {
            console.error('Error reading live data:', error);
            return this.getDefaultData();
        }
    }

    // Set live detection data
    setLiveData(data) {
        try {
            const fullData = {
                ...data,
                lastUpdated: new Date().toISOString(),
                timestamp: Date.now()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(fullData));
            this.notifyListeners();
        } catch (error) {
            console.error('Error saving live data:', error);
        }
    }

    // Update specific fields in live data
    updateLiveData(updates) {
        const currentData = this.getLiveData();
        this.setLiveData({ ...currentData, ...updates });
    }

    // Get default data structure
    getDefaultData() {
        return {
            // Current session data
            currentSession: {
                isActive: false,
                startTime: null,
                peopleCount: 0,
                confidence: 0,
                fps: 0,
                sessionDuration: 0,
                objectsDetected: 0
            },
            
            // Today's summary
            todaySummary: {
                detections: 0,
                alerts: 0,
                peopleCount: 0,
                accuracy: 0
            },
            
            // System stats
            systemStats: {
                activeCameras: 0,
                activeAlerts: 0,
                totalDetections: 0,
                totalPeople: 0
            },
            
            // People counting
            peopleCounting: {
                current: 0,
                totalIn: 0,
                totalOut: 0,
                lastChange: 0
            },
            
            // Object counts
            objectCounts: {
                person: 0,
                car: 0,
                bicycle: 0,
                motorcycle: 0,
                bus: 0,
                truck: 0
            }
        };
    }

    // Add listener for data changes
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Remove listener
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    // Notify all listeners
    notifyListeners() {
        const data = this.getLiveData();
        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('Error in data listener:', error);
            }
        });
    }

    // Simulate live data updates (for demo purposes)
    startDemoUpdates() {
        this.demoInterval = setInterval(() => {
            const currentData = this.getLiveData();
            
            // Only update if there's an active session
            if (currentData.currentSession.isActive) {
                const updates = {
                    currentSession: {
                        ...currentData.currentSession,
                        peopleCount: Math.floor(Math.random() * 15),
                        confidence: Math.random() * 0.3 + 0.7,
                        fps: Math.floor(Math.random() * 10) + 20,
                        objectsDetected: Math.floor(Math.random() * 8),
                        sessionDuration: currentData.currentSession.startTime ? 
                            Math.floor((Date.now() - new Date(currentData.currentSession.startTime).getTime()) / 1000) : 0
                    },
                    todaySummary: {
                        detections: currentData.todaySummary.detections + Math.floor(Math.random() * 3),
                        alerts: currentData.todaySummary.alerts + (Math.random() > 0.8 ? 1 : 0),
                        peopleCount: currentData.todaySummary.peopleCount + Math.floor(Math.random() * 2),
                        accuracy: Math.random() * 0.2 + 0.8
                    }
                };
                
                this.updateLiveData(updates);
            }
        }, 2000);
    }

    // Stop demo updates
    stopDemoUpdates() {
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
    }
}

// Create global instance
window.dataManager = new DataManager();