const Storage = {
  KEY: 'areaCalculatorHistory',

  getAll() {
    try {
      const data = localStorage.getItem(this.KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  save(entry) {
    try {
      const history = this.getAll();
      entry.id = Date.now();
      entry.date = new Date().toLocaleString('ar-EG');
      history.unshift(entry);
      if (history.length > 50) history.pop();
      localStorage.setItem(this.KEY, JSON.stringify(history));
      return entry;
    } catch {
      return null;
    }
  },

  getById(id) {
    return this.getAll().find(e => e.id === id) || null;
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  exportAll() {
    const data = this.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `area-calculator-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
