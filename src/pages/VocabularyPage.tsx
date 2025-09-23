import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Button,
  Input,
  Select,
  Pagination,
  Spin,
  Modal,
  Form,
  message,
  Row,
  Col,
  Space,
  Statistic,
  Radio,
  Table,
  Popconfirm,
  Dropdown,
  Avatar
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  SoundOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DragOutlined,
  UndoOutlined,
  ClearOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons';
import { VocabularyService } from '../services/vocabularyService';
import { AuthService } from '../services/authService';
import { Word, PageData, SearchParams, AuthUser } from '../types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const VocabularyPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [words, setWords] = useState<Word[]>([]);
  const [pageData, setPageData] = useState<PageData>({
    currentPage: 1,
    totalPages: 1,
    totalWords: 0,
    pageSize: 12,
    startIndex: 1,
    endIndex: 12
  });
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const [loginVisible, setLoginVisible] = useState<boolean>(false);
  const [registerVisible, setRegisterVisible] = useState<boolean>(false);
  const [wordsVisible, setWordsVisible] = useState<boolean>(true);
  const [translationsVisible, setTranslationsVisible] = useState<boolean>(true);
  const [selectedAccent, setSelectedAccent] = useState<'us' | 'uk'>('us');
  const [stats, setStats] = useState<any>(null);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  // 防重复调用机制
  const knownWordsLoadingRef = React.useRef<boolean>(false);
  const lastKnownWordsLoadTime = React.useRef<number>(0);

  const vocabularyService = new VocabularyService();
  const authService = new AuthService();

  useEffect(() => {
    const initializeApp = async () => {
      // 先检查认证状态
      await checkAuthStatus();
      // 然后加载页面内容
      await loadPage(pageData.currentPage);
    };
    initializeApp();
  }, []);

  const loadPage = async (page: number) => {
    setLoading(true);
    try {
      if (isSearchMode && searchQuery) {
        // 搜索模式下的分页
        const response = await vocabularyService.searchWords(searchQuery, page, pageData.pageSize);
        if (response.code === 0) {
          setWords(response.data.items || []);
          setPageData(prev => ({
            ...prev,
            currentPage: page,
            totalPages: Math.ceil((response.data.total || 0) / prev.pageSize),
            totalWords: response.data.total || 0,
            startIndex: (page - 1) * prev.pageSize + 1,
            endIndex: Math.min(page * prev.pageSize, response.data.total || 0)
          }));
          await loadKnownWords();
        }
      } else {
        // 普通模式下的分页
        const response = await vocabularyService.getWords(page, pageData.pageSize);
        if (response.code === 0) {
          setWords(response.data.items || []);
          setPageData(prev => ({
            ...prev,
            currentPage: page,
            totalPages: Math.ceil((response.data.total || 0) / prev.pageSize),
            totalWords: response.data.total || 0,
            startIndex: (page - 1) * prev.pageSize + 1,
            endIndex: Math.min(page * prev.pageSize, response.data.total || 0)
          }));
          await loadKnownWords();
        }
      }
    } catch (error) {
      message.error('加载词汇失败');
    } finally {
      setLoading(false);
    }
  };

  const loadPageWithPageSize = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      if (isSearchMode && searchQuery) {
        // 搜索模式下的分页
        const response = await vocabularyService.searchWords(searchQuery, page, pageSize);
        if (response.code === 0) {
          setWords(response.data.items || []);
          setPageData(prev => ({
            ...prev,
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil((response.data.total || 0) / pageSize),
            totalWords: response.data.total || 0,
            startIndex: (page - 1) * pageSize + 1,
            endIndex: Math.min(page * pageSize, response.data.total || 0)
          }));
          await loadKnownWords();
        }
      } else {
        // 普通模式下的分页
        const response = await vocabularyService.getWords(page, pageSize);
        if (response.code === 0) {
          setWords(response.data.items || []);
          setPageData(prev => ({
            ...prev,
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil((response.data.total || 0) / pageSize),
            totalWords: response.data.total || 0,
            startIndex: (page - 1) * pageSize + 1,
            endIndex: Math.min(page * pageSize, response.data.total || 0)
          }));
          await loadKnownWords();
        }
      }
    } catch (error) {
      message.error('加载词汇失败');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      try {
        // 验证token是否有效
        const response = await authService.getCurrentUser();
        if (response.code === 0) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          // 验证成功后加载已知单词
          await loadKnownWords();
        } else {
          // token无效，清除本地存储
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setUser(null);
        }
      } catch (error) {
        // token验证失败，清除本地存储
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setUser(null);
      }
    }
  };

  const loadKnownWords = async () => {
    // 检查本地是否有token，而不是依赖user状态
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // 防重复调用：5秒内只能调用一次
    const now = Date.now();
    if (knownWordsLoadingRef.current || (now - lastKnownWordsLoadTime.current < 5000)) {
      return;
    }

    knownWordsLoadingRef.current = true;
    lastKnownWordsLoadTime.current = now;

    try {
      const response = await vocabularyService.getKnownWords();
      if (response.code === 0) {
        const wordIds = response.data.words.map(word => word.id);
        setKnownWords(new Set(wordIds));
      }
    } catch (error) {
      console.error('Failed to load known words:', error);
    } finally {
      knownWordsLoadingRef.current = false;
    }
  };

  const handleSearch = async (values: SearchParams) => {
    setLoading(true);
    try {
      const response = await vocabularyService.searchWords(values.q, 1, pageData.pageSize);
      console.log('Search response:', response); // 调试日志
      if (response.code === 0) {
        const searchData = response.data.items || [];
        setWords(searchData);
        setIsSearchMode(true);
        setSearchQuery(values.q);
        setPageData(prev => ({
          ...prev,
          currentPage: 1,
          totalPages: Math.ceil((response.data.total || 0) / prev.pageSize),
          totalWords: response.data.total || 0,
          startIndex: 1,
          endIndex: Math.min(prev.pageSize, response.data.total || 0)
        }));
        setSearchVisible(false);
        message.success(`找到 ${response.data.total || 0} 个结果`);
      } else {
        message.error(response.msg || '搜索失败');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      message.error('搜索失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: any) => {
    try {
      const response = await authService.login(values.username, values.password);
      if (response.code === 0) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setLoginVisible(false);
        loginForm.resetFields();
        await loadKnownWords();
        message.success('登录成功');
      } else {
        message.error(response.msg || '登录失败');
      }
    } catch (error) {
      message.error('登录失败');
    }
  };

  const handleRegister = async (values: any) => {
    try {
      const response = await authService.register(values);
      if (response.code === 0) {
        message.success('注册成功，请登录');
        setRegisterVisible(false);
        registerForm.resetFields();
        setLoginVisible(true);
      } else {
        message.error(response.msg || '注册失败');
      }
    } catch (error) {
      message.error('注册失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    message.success('退出登录成功');
  };

  const playPronunciation = (word: string) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = selectedAccent === 'us' ? 'en-US' : 'en-GB';
    window.speechSynthesis.speak(utterance);
  };

  const markWord = async (wordId: string, known: boolean) => {
    if (!user) {
      message.warning('请先登录后再标记单词');
      setLoginVisible(true);
      return;
    }

    try {
      let response;
      if (known) {
        response = await vocabularyService.markWord(wordId);
      } else {
        response = await vocabularyService.unmarkWord(wordId);
      }

      if (response.code === 0) {
        const newKnownWords = new Set(knownWords);
        if (known) {
          newKnownWords.add(wordId);
        } else {
          newKnownWords.delete(wordId);
        }
        setKnownWords(newKnownWords);
        message.success(known ? '标记为已认识' : '标记为不认识');
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error: any) {
      console.error('Mark word error:', error);
      if (error.response?.status === 401) {
        message.warning('登录已过期，请重新登录');
        handleLogout();
      } else {
        message.error('操作失败，请检查网络连接');
      }
    }
  };

  const toggleWordsVisibility = () => {
    setWordsVisible(!wordsVisible);
  };

  const toggleTranslationsVisibility = () => {
    setTranslationsVisible(!translationsVisible);
  };

  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
  };

  const restoreOrder = () => {
    loadPage(pageData.currentPage);
  };

  const exitSearchMode = () => {
    setIsSearchMode(false);
    setSearchQuery('');
    loadPage(1);
  };

  const resetKnownWords = async (forgetType: 'current' | 'all' = 'all') => {
    if (!user) {
      message.warning('请先登录后再重置');
      setLoginVisible(true);
      return;
    }

    try {
      let wordIds: string[] = [];
      if (forgetType === 'current') {
        // Get word IDs from current page
        wordIds = words.map(word => word.id);
      }

      const response = await vocabularyService.resetKnownWords(wordIds);
      if (response.code === 0) {
        // Update known words set
        if (forgetType === 'current') {
          const newKnownWords = new Set(knownWords);
          wordIds.forEach(id => newKnownWords.delete(id));
          setKnownWords(newKnownWords);
          message.success(`已忘光当前页 ${wordIds.length} 个单词`);
        } else {
          setKnownWords(new Set());
          message.success('已忘光全部单词');
        }
      } else {
        message.error(response.msg || '重置失败');
      }
    } catch (error: any) {
      console.error('Reset words error:', error);
      if (error.response?.status === 401) {
        message.warning('登录已过期，请重新登录');
        handleLogout();
      } else {
        message.error('重置失败，请检查网络连接');
      }
    }
  };

  const loadStats = async () => {
    try {
      const response = await vocabularyService.getStats();
      if (response.code === 0) {
        setStats(response.data);
        setStatsVisible(true);
      }
    } catch (error) {
      message.error('获取统计信息失败');
    }
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <div className="header-content">
          <div className="header-left">
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              <BookOutlined /> Word Hero
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              雅思词汇学习系统
            </Text>
          </div>
          <div className="header-right">
            <Space>
              <Button
                icon={<BarChartOutlined />}
                onClick={loadStats}
                type="text"
                style={{ color: 'white' }}
              >
                统计
              </Button>
              {user ? (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'profile',
                        icon: <UserOutlined />,
                        label: '个人资料',
                        onClick: () => message.info('个人资料功能开发中')
                      },
                      {
                        key: 'settings',
                        icon: <SettingOutlined />,
                        label: '设置',
                        onClick: () => message.info('设置功能开发中')
                      },
                      {
                        type: 'divider'
                      },
                      {
                        key: 'logout',
                        icon: <LogoutOutlined />,
                        label: '退出登录',
                        onClick: handleLogout
                      }
                    ]
                  }}
                  placement="bottomRight"
                  arrow
                >
                  <Space style={{
                    color: 'white',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s'
                  }}
                  className="user-profile-dropdown">
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{
                        backgroundColor: '#f56a00',
                        marginRight: '8px'
                      }}
                    />
                    <Text style={{ color: 'white' }}>
                      {user.username}
                    </Text>
                    <DownOutlined style={{ color: 'white', fontSize: '12px' }} />
                  </Space>
                </Dropdown>
              ) : (
                <Space>
                  <Button
                    onClick={() => setLoginVisible(true)}
                    type="text"
                    style={{ color: 'white' }}
                  >
                    登录
                  </Button>
                  <Button
                    onClick={() => setRegisterVisible(true)}
                    type="text"
                    style={{ color: 'white' }}
                  >
                    注册
                  </Button>
                </Space>
              )}
            </Space>
          </div>
        </div>
      </Header>

      <Content className="content">
        <div className="action-bar">
          <Space wrap>
            <Button
              icon={<SearchOutlined />}
              onClick={() => setSearchVisible(true)}
            >
              搜索
            </Button>
            <Button
              icon={wordsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={toggleWordsVisibility}
            >
              单词
            </Button>
            <Button
              icon={translationsVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={toggleTranslationsVisibility}
            >
              翻译
            </Button>
            <Button
              icon={<DragOutlined />}
              onClick={shuffleWords}
            >
              打乱
            </Button>
            <Button
              icon={<UndoOutlined />}
              onClick={restoreOrder}
            >
              恢复
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'current',
                    label: (
                      <Popconfirm
                        title="确认忘光当前页"
                        description="确定要忘光当前页的所有已认识单词吗？"
                        onConfirm={() => resetKnownWords('current')}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span>忘光当前页</span>
                      </Popconfirm>
                    ),
                  },
                  {
                    key: 'all',
                    label: (
                      <Popconfirm
                        title="确认忘光全部"
                        description="确定要忘光所有已认识的单词吗？此操作不可恢复！"
                        onConfirm={() => resetKnownWords('all')}
                        okText="确定"
                        cancelText="取消"
                      >
                        <span style={{ color: 'red' }}>忘光全部</span>
                      </Popconfirm>
                    ),
                  },
                ],
              }}
              disabled={!user}
            >
              <Button
                icon={<ClearOutlined />}
                disabled={!user}
                title={!user ? "请先登录" : undefined}
              >
                忘光
              </Button>
            </Dropdown>
            <Radio.Group
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
            >
              <Radio.Button value="us">🇺🇸 美式</Radio.Button>
              <Radio.Button value="uk">🇬🇧 英式</Radio.Button>
            </Radio.Group>
          </Space>
        </div>

        <div className="page-controls">
          <div className="page-info">
            <Text strong>
              {isSearchMode ? (
                <>
                  搜索结果：{pageData.totalWords} 个
                  <Button
                    type="link"
                    size="small"
                    onClick={exitSearchMode}
                    style={{ marginLeft: 8 }}
                  >
                    退出搜索
                  </Button>
                </>
              ) : (
                `总计：${pageData.totalWords}`
              )}
            </Text>
            <Select
              value={pageData.pageSize}
              style={{ width: 120 }}
              onChange={(value) => {
                setPageData(prev => ({ ...prev, pageSize: value }));
                // 直接传递新的页面大小，避免状态更新异步问题
                loadPageWithPageSize(1, value);
              }}
            >
              <Option value={12}>12个/页</Option>
              <Option value={24}>24个/页</Option>
              <Option value={36}>36个/页</Option>
              <Option value={48}>48个/页</Option>
              <Option value={60}>60个/页</Option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              dataSource={Array.isArray(words) ? words : []}
              rowKey="id"
              pagination={false}
              className="vocabulary-table"
              rowClassName={(record) => knownWords.has(record.id) ? 'known-row' : ''}
              scroll={{ x: true }}
            >
              <Table.Column
                title="序号"
                key="index"
                width="10%"
                align="center"
                render={(text, record, index) => (
                  <Text style={{ fontSize: '14px' }}>
                    {index + 1}
                  </Text>
                )}
              />
              <Table.Column
                title="英文单词"
                dataIndex="english"
                key="english"
                width="35%"
                render={(text, record) => (
                  <Text strong style={{ fontSize: '16px' }}>
                    {wordsVisible ? text : '单词已隐藏'}
                  </Text>
                )}
              />
              <Table.Column
                title="中文翻译"
                dataIndex="chinese"
                key="chinese"
                width="35%"
                render={(text, record) => (
                  <Text style={{ fontSize: '14px' }}>
                    {translationsVisible ? text : '翻译已隐藏'}
                  </Text>
                )}
              />
              <Table.Column
                title="操作"
                key="actions"
                width="20%"
                align="center"
                render={(_, record) => (
                  <Space size="small">
                    <Button
                      type="text"
                      icon={<SoundOutlined />}
                      onClick={() => playPronunciation(record.english)}
                      title="发音"
                    />
                    <Button
                      type={knownWords.has(record.id) ? "default" : "primary"}
                      size="small"
                      onClick={() => markWord(record.id, !knownWords.has(record.id))}
                      disabled={!user}
                      title={!user ? "请先登录" : undefined}
                    >
                      {knownWords.has(record.id) ? '不认识' : '认识'}
                    </Button>
                  </Space>
                )}
              />
            </Table>

            <div className="pagination-container">
              <Pagination
                current={pageData.currentPage}
                total={pageData.totalWords}
                pageSize={pageData.pageSize}
                onChange={(page) => loadPage(page)}
                showSizeChanger={false}
                showQuickJumper={false}
                showLessItems={true}
                size="default"
                simple={false}
              />
            </div>
          </>
        )}
      </Content>

      {/* 搜索模态框 */}
      <Modal
        title="搜索词汇"
        open={searchVisible}
        onCancel={() => setSearchVisible(false)}
        footer={null}
      >
        <Form form={searchForm} onFinish={handleSearch}>
          <Form.Item name="q" rules={[{ required: true, message: '请输入搜索内容' }]}>
            <Input
              placeholder="输入英文单词或中文翻译"
              onPressEnter={() => searchForm.submit()}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => searchForm.submit()}
              block
            >
              搜索
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 登录模态框 */}
      <Modal
        title="用户登录"
        open={loginVisible}
        onCancel={() => setLoginVisible(false)}
        footer={null}
      >
        <Form form={loginForm} onFinish={handleLogin}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名或邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 注册模态框 */}
      <Modal
        title="用户注册"
        open={registerVisible}
        onCancel={() => setRegisterVisible(false)}
        footer={null}
      >
        <Form form={registerForm} onFinish={handleRegister}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item
            name="full_name"
          >
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="确认密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              注册
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 统计模态框 */}
      <Modal
        title="学习统计"
        open={statsVisible}
        onCancel={() => setStatsVisible(false)}
        footer={null}
        width={600}
      >
        {stats && (
          <div className="stats-content">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="已认识单词" value={stats.totalKnownWords || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="学习天数" value={stats.totalLearningDays || 0} />
              </Col>
              <Col span={8}>
                <Statistic title="日均单词" value={stats.averageWordsPerDay || 0} />
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default VocabularyPage;