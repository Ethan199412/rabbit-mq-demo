interface IRecord {
  id: string;
  status: 'UNPAID';
}

class Store {
  records: Record<string, IRecord> = {};
}

export default new Store();
