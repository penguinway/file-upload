import React, { useState, useEffect, useContext } from 'react';
import { Input, Button, List, Message, Spin, Typography, Popconfirm } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import axios from 'axios';

const { TextArea } = Input;
const ClipboardContext = React.createContext();
// const local = "http://localhost:8080"
const local = ""
const ClipboardProvider = ({ children }) => {
  const [clipboardData, setClipboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClipboardData();
  }, []);

  const fetchClipboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${local}/clipboard/info`);
      setClipboardData(response.data.data.map(item => ({
        ...item,
        createTime: new Date(item.time).toLocaleString('zh-CN', { timeZone: 'UTC' }) // Assuming 'time' is a timestamp in milliseconds
      })));
    } catch (error) {
      Message.error('获取剪贴板内容失败，请联系站点管理员');
    } finally {
      setLoading(false);
    }
  };

  const addClipboardItem = async (context) => {
    const formData = new FormData();
    formData.append('context', context);
    
    try {
      const response = await axios.post(`${local}/clipboard`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setClipboardData([...clipboardData, {
        ...response.data,
        createTime: new Date(response.data.time).toLocaleString() // Assuming 'time' is a timestamp in milliseconds
      }]);
      Message.success('上传剪贴板成功');
    } catch (error) {
      Message.error('上传剪贴板失败');
    }
    fetchClipboardData();
  };

  const deleteClipboardItem = async (id) => {
    try {
      await axios.delete(`${local}/clipboard/delete?id=${id}`);
      setClipboardData(clipboardData.filter(item => item.id !== id));
      Message.success('删除成功');
    } catch (error) {
      Message.error('删除失败');
    }
  };

  return (
    <ClipboardContext.Provider value={{ clipboardData, addClipboardItem, deleteClipboardItem, loading }}>
      {children}
    </ClipboardContext.Provider>
  );
};

const ClipboardForm = () => {
  const [context, setContext] = useState('');
  const { addClipboardItem } = useContext(ClipboardContext);

  const handleSubmit = () => {
    if (context.trim()) {
      addClipboardItem(context);
      setContext('');
    } else {
      Message.warning('内容不能为空');
    }
  };

  return (
    <div>
      <TextArea
        placeholder="请输入内容"
        value={context}
        onChange={(value) => setContext(value)}
        autoSize={{ minRows: 3, maxRows: 5 }}
      />
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: 8 }}>
        上传到剪贴板
      </Button>
    </div>
  );
};

const ClipboardList = () => {
  const { clipboardData, loading, deleteClipboardItem } = useContext(ClipboardContext);

  if (loading) {
    return <Spin />;
  }

  return (
    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <List
        dataSource={clipboardData}
        render={(item) => (
          <List.Item key={item.id}>
            <Typography.Paragraph copyable>{item.context}</Typography.Paragraph>
            <Typography.Text type="secondary">{item.createTime}</Typography.Text>
            <Popconfirm
              title="确定要删除此项吗？"
              onOk={() => deleteClipboardItem(item.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" style={{ marginLeft: 20 }}>{<IconDelete />}</Button>
            </Popconfirm>
          </List.Item>
        )}
      />
    </div>
  );
};

const App = () => (
  <ClipboardProvider>
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Typography.Title heading={2} style={{textAlign: 'center'}}>在线剪贴板</Typography.Title>
      <ClipboardForm />
      <ClipboardList />
    </div>
  </ClipboardProvider>
);

export default App;
