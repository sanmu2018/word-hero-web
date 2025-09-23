import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import VocabularyPage from './pages/VocabularyPage';
import './App.css';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<VocabularyPage />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;