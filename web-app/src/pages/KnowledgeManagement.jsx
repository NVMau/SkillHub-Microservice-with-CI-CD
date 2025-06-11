import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Scene from './Scene';
import { createKnowledge, searchKnowledge, getKnowledgeList, deleteKnowledge } from '../services/knowledgeService';

export default function KnowledgeManagement() {
  // State for knowledge list and pagination
  const [knowledgeList, setKnowledgeList] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedKnowledge, setSelectedKnowledge] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch knowledge list
  const fetchKnowledgeList = async () => {
    try {
      setIsLoading(true);
      const response = await getKnowledgeList(page + 1, rowsPerPage);
      if (response && response.data && response.data.data) {
        setKnowledgeList(response.data.data);
        setTotal(response.data.pagination.total);
      } else {
        setKnowledgeList([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      showSnackbar('Không thể tải danh sách bài viết', 'error');
      setKnowledgeList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Search knowledge
  const handleSearch = async () => {
    try {
      setIsLoading(true);
      const response = await searchKnowledge(searchQuery, rowsPerPage);
      if (response && response.data && response.data.data) {
        setKnowledgeList(response.data.data);
        setTotal(response.data.data.length);
      } else {
        setKnowledgeList([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error searching knowledge:', error);
      showSnackbar('Lỗi khi tìm kiếm', 'error');
      setKnowledgeList([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog
  const handleOpenDialog = (mode, knowledge = null) => {
    setDialogMode(mode);
    setSelectedKnowledge(knowledge);
    if (knowledge) {
      setFormData({
        title: knowledge.title,
        content: knowledge.content,
      });
    } else {
      setFormData({
        title: '',
        content: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedKnowledge(null);
    setFormData({
      title: '',
      content: '',
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await createKnowledge(formData);
        showSnackbar('Tạo bài viết thành công', 'success');
      }
      handleCloseDialog();
      fetchKnowledgeList();
    } catch (error) {
      console.error('Error submitting knowledge:', error);
      showSnackbar('Có lỗi xảy ra', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await deleteKnowledge(id);
        showSnackbar('Xóa bài viết thành công', 'success');
        fetchKnowledgeList();
      } catch (error) {
        console.error('Error deleting knowledge:', error);
        showSnackbar('Không thể xóa bài viết', 'error');
      }
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Show snackbar
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Handle snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Initial fetch
  useEffect(() => {
    fetchKnowledgeList();
  }, [page, rowsPerPage]);

  return (
    <Scene>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 4,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Quản lý bài viết
          </Typography>
          <Typography variant="subtitle1">
            Tạo và quản lý các bài viết chia sẻ kiến thức
          </Typography>
        </Paper>

        {/* Search and Add */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('create')}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Thêm mới
          </Button>
        </Stack>

        {/* Knowledge List */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : knowledgeList && knowledgeList.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Cập nhật lần cuối</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {knowledgeList.map((knowledge) => (
                  <TableRow key={knowledge.id}>
                    <TableCell>{knowledge.title}</TableCell>
                    <TableCell>{knowledge.content}</TableCell>
                    <TableCell>
                      {new Date(knowledge.last_updated_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xóa">
                        <IconButton
                          onClick={() => handleDelete(knowledge.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Không có bài viết nào
              </Typography>
            </Box>
          )}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Số dòng mỗi trang:"
          />
        </TableContainer>

        {/* Create Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogMode === 'create' ? 'Thêm bài viết mới' : 'Chỉnh sửa bài viết'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                fullWidth
                label="Nội dung"
                multiline
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
            >
              {dialogMode === 'create' ? 'Tạo' : 'Cập nhật'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Scene>
  );
} 