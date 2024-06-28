import React, { useEffect, useState } from 'react';
import { Typography, List, Button, Message, Space } from '@arco-design/web-react';
import { IconDownload } from '@arco-design/web-react/icon';
import axios from 'axios';
import './file.css'; // 引入CSS文件

const { Title, Text } = Typography;

const Filelist = () => {
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    // 获取文件列表
    axios.get('/file')
      .then(response => {
        setFileList(response.data.files);
      })
      .catch(error => {
        Message.error('获取文件列表失败');
        console.error(error);
      });
  }, []);

  const handleDownload = (filename) => {
    // 下载文件
    window.location.href = `/download?filename=${filename}`;
  };

  return (
    <div className="file-list-container">
      <div className="header-container">
        <Title heading={2} className="title">文件列表</Title>
        <Text type="secondary" className="description">
          点击下载按钮即可下载
        </Text>
      </div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <List
          dataSource={fileList}
          render={(item) => (
            <List.Item
              key={item}
              extra={
                <Button type="primary" icon={<IconDownload />} onClick={() => handleDownload(item)}>下载</Button>
              }
            >
              <Typography.Text>{item}</Typography.Text>
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

export default Filelist;
