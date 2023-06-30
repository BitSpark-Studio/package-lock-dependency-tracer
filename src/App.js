import React, { useState } from 'react';
import { Container, Label, Input, Button, Card, CardBody, CardTitle, ListGroup, ListGroupItem } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [packageLock, setPackageLock] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dependencyCycle, setDependencyCycle] = useState([]);

  // Function to handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      // Parse the package-lock.json file content
      const parsedData = JSON.parse(content);
      setPackageLock(parsedData);
    };

    reader.readAsText(file);
  };

  // Function to search for dependency usage cycle
  const searchDependency = () => {
    if (!packageLock || !searchTerm) {
      return;
    }

    const foundDependencies = [];
    const searchQueue = [searchTerm];
    const processedDependencies = new Set();

    while (searchQueue.length > 0) {
      const currentDependency = searchQueue.shift();

      // Check if the current dependency exists in the package-lock.json
      if (packageLock.dependencies[currentDependency]) {
        foundDependencies.push(currentDependency);

        // Check if the current dependency is used by other dependencies
        Object.entries(packageLock.dependencies).forEach(([key, value]) => {
          if (value.requires && value.requires[currentDependency]) {
            if (!processedDependencies.has(key)) {
              searchQueue.push(key);
              processedDependencies.add(key);
            }
          }
        });
      }
    }

    setDependencyCycle(foundDependencies);
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4">Dependency Usage Cycle Finder</h1>
      <div className="mb-3">
        <Label htmlFor="fileUpload">Upload package-lock.json</Label>
        <Input
          type="file"
          id="fileUpload"
          accept=".json"
          onChange={handleFileUpload}
        />
      </div>
      <div className="mb-3">
        <Label htmlFor="searchBox">Search Dependency</Label>
        <Input
          type="text"
          id="searchBox"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Button color="primary" onClick={searchDependency}>Search</Button>
      <div className="mt-3">
        {dependencyCycle.length > 0 && (
          <Card>
            <CardBody>
              <CardTitle tag="h5">Dependency Usage Cycle:</CardTitle>
              <ListGroup>
                {dependencyCycle.map((dependency, index) => (
                  <ListGroupItem key={index}>{dependency}</ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default App;
