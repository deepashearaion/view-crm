import React, { useState, useRef, useEffect } from 'react';
import {
    Star,
    ChevronDown,
    ChevronRight,
    ListFilter,
    RotateCw,
    Search,
    Image,
    Images,
    ImagePlus,
    Lightbulb,
    Bot,
    FileUp,
    Headset,
    BookOpen,
    FileText,
    Music,
    Headphones,
    FileSpreadsheet,
    List,
    LayoutGrid,
    CloudUpload,
    Info,
    X,
    Folder,
    File,
    Trash2,
    Download
} from 'lucide-react';
import './FileCabinet.css';

const initialCategories = [
    {
        id: 'images',
        title: 'Images',
        icon: Image,
        color: '#F43F5E',
        theme: 'fc-card-pink',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 0
    },
    {
        id: 'quotations',
        title: 'Quotations',
        icon: FileText,
        color: '#22C55E',
        theme: 'fc-card-green',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 0
    },
    {
        id: 'call-recordings',
        title: 'Call Recordings',
        icon: Music,
        color: '#6366F1',
        theme: 'fc-card-purple',
        itemsCount: 1633,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 25
    },
    {
        id: 'documents',
        title: 'Documents',
        icon: FileText,
        color: '#F59E0B',
        theme: 'fc-card-amber',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 0
    },
    {
        id: 'bot-images',
        title: 'Bot Images',
        icon: Images,
        color: '#00B589',
        theme: 'fc-card-teal',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        limitRatio: '0/10',
        progress: 0
    },
    {
        id: 'bot-documents',
        title: 'Bot Documents',
        icon: FileText,
        color: '#2563EB',
        theme: 'fc-card-purple',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 0
    },
    {
        id: 'sales-articles',
        title: 'Sales Articles',
        icon: BookOpen,
        color: '#9333EA',
        theme: 'fc-card-lavender',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        limitRatio: '0/10',
        progress: 0
    },
    {
        id: 'service-articles',
        title: 'Service Articles',
        icon: Headphones,
        color: '#14B8A6',
        theme: 'fc-card-teal',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        limitRatio: '0/10',
        progress: 0
    },
    {
        id: 'invoices',
        title: 'Invoices',
        icon: FileSpreadsheet,
        color: '#10B981',
        theme: 'fc-card-emerald',
        itemsCount: 0,
        storageUsed: '0.00 KB of 6.0 GB',
        progress: 0
    }
];

const dateOptions = [
    'This Month',
    'Today',
    'Yesterday',
    'This Week',
    'Last Week',
    'This Year',
    'All Time'
];

const ownerOptions = ['Arun', 'All', 'Priya'];

const FileCabinet = ({ setCurrentPage }) => {
    // Toolbar states
    const [selectedDate, setSelectedDate] = useState('This Month');
    const [isStarred, setIsStarred] = useState(false);
    const [selectedOwner, setSelectedOwner] = useState('Arun');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Dropdown states
    const [openDropdown, setOpenDropdown] = useState(null);

    // Categories and selection
    const [categories, setCategories] = useState(initialCategories);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // View toggle: 'list' or 'grid'
    const [viewMode, setViewMode] = useState('list');

    // Files state (defaults to empty matching screenshot)
    const [files, setFiles] = useState([]);

    // Modal states
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadCategory, setUploadCategory] = useState('Documents');

    // AI Chatbot Media Modal states
    const [mediaType, setMediaType] = useState('image'); // 'image' or 'document'
    const [mediaTitle, setMediaTitle] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [botImagesCount, setBotImagesCount] = useState(0);
    const [botDocsCount, setBotDocsCount] = useState(0);

    // AI Chatbot Knowledge Base / Articles Modal states
    const [articleType, setArticleType] = useState('sales'); // 'sales' or 'service'
    const [articleTitle, setArticleTitle] = useState('');
    const [articleFile, setArticleFile] = useState(null);
    const [salesArticlesCount, setSalesArticlesCount] = useState(0);
    const [serviceArticlesCount, setServiceArticlesCount] = useState(0);

    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null);
    const directFileInputRef = useRef(null);
    const chatbotFileInputRef = useRef(null);
    const articleFileInputRef = useRef(null);

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 600);
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        if (!uploadFile) {
            alert('Please select a file to upload');
            return;
        }

        const newFile = {
            id: Date.now(),
            name: uploadFile.name,
            size: (uploadFile.size / 1024).toFixed(2) + ' KB',
            category: uploadCategory,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            owner: selectedOwner
        };

        setFiles(prev => [newFile, ...prev]);

        // Increment count in corresponding category card
        setCategories(prev => prev.map(cat => {
            if (cat.title.toLowerCase().includes(uploadCategory.toLowerCase()) || uploadCategory.toLowerCase().includes(cat.title.toLowerCase())) {
                return { ...cat, itemsCount: cat.itemsCount + 1 };
            }
            return cat;
        }));

        setIsUploadOpen(false);
        setUploadFile(null);
    };

    const handleDirectFileUpload = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const uploadedList = Array.from(e.target.files).map((file, idx) => {
            // Auto detect category from file type/extension or current selection
            let cat = selectedCategory || 'Documents';
            const ext = file.name.split('.').pop().toLowerCase();

            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) {
                cat = 'Images';
            } else if (['mp3', 'wav', 'm4a', 'aac', 'ogg'].includes(ext)) {
                cat = 'Call Recordings';
            } else if (['xlsx', 'xls', 'csv'].includes(ext)) {
                cat = 'Invoices';
            } else if (['doc', 'docx'].includes(ext)) {
                cat = 'Documents';
            } else if (['pdf'].includes(ext)) {
                cat = 'Quotations';
            }

            return {
                id: Date.now() + idx,
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                category: cat,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                owner: selectedOwner
            };
        });

        // Add new files to state
        setFiles(prev => [...uploadedList, ...prev]);

        // Update category counts
        setCategories(prev => prev.map(c => {
            const count = uploadedList.filter(f => f.category === c.title).length;
            if (count > 0) {
                const nextCount = c.itemsCount + count;
                return {
                    ...c,
                    itemsCount: nextCount,
                    progress: Math.min(100, Math.round((nextCount / (c.limitRatio ? 10 : 20)) * 100))
                };
            }
            return c;
        }));

        e.target.value = '';
    };

    const handleUploadChatbotMedia = (e) => {
        e.preventDefault();
        if (!mediaFile) {
            if (chatbotFileInputRef.current) {
                chatbotFileInputRef.current.click();
            }
            return;
        }

        const title = mediaTitle.trim() || mediaFile.name;
        const categoryName = mediaType === 'image' ? 'Bot Images' : 'Bot Documents';

        const newFile = {
            id: Date.now(),
            name: title,
            size: (mediaFile.size / 1024).toFixed(2) + ' KB',
            category: categoryName,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            owner: selectedOwner
        };

        setFiles(prev => [newFile, ...prev]);

        if (mediaType === 'image') {
            const nextCount = Math.min(10, botImagesCount + 1);
            setBotImagesCount(nextCount);
            setCategories(prev => prev.map(cat => {
                if (cat.title === 'Bot Images') {
                    return { ...cat, itemsCount: nextCount, progress: (nextCount / 10) * 100, limitRatio: `${nextCount}/10` };
                }
                return cat;
            }));
        } else {
            const nextCount = botDocsCount + 1;
            setBotDocsCount(nextCount);
            setCategories(prev => prev.map(cat => {
                if (cat.title === 'Bot Documents') {
                    return { ...cat, itemsCount: nextCount, progress: Math.min(100, nextCount * 10) };
                }
                return cat;
            }));
        }

        setIsMediaModalOpen(false);
        setMediaTitle('');
        setMediaFile(null);
    };

    const handleUploadArticle = (e) => {
        if (e) e.preventDefault();
        if (!articleFile && !articleTitle.trim()) {
            if (articleFileInputRef.current) {
                articleFileInputRef.current.click();
            }
            return;
        }

        const title = articleTitle.trim() || (articleFile ? articleFile.name : 'New Article');
        const fileName = (title.endsWith('.doc') || title.endsWith('.docx')) ? title : `${title}.docx`;
        const categoryName = articleType === 'sales' ? 'Sales Articles' : 'Service Articles';

        const newFile = {
            id: Date.now(),
            name: fileName,
            size: articleFile ? (articleFile.size / 1024).toFixed(2) + ' KB' : '24.50 KB',
            category: categoryName,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            owner: selectedOwner
        };

        setFiles(prev => [newFile, ...prev]);

        if (articleType === 'sales') {
            const nextCount = Math.min(10, salesArticlesCount + 1);
            setSalesArticlesCount(nextCount);
            setCategories(prev => prev.map(cat => {
                if (cat.title === 'Sales Articles') {
                    return { ...cat, itemsCount: nextCount, progress: (nextCount / 10) * 100, limitRatio: `${nextCount}/10` };
                }
                return cat;
            }));
        } else {
            const nextCount = Math.min(10, serviceArticlesCount + 1);
            setServiceArticlesCount(nextCount);
            setCategories(prev => prev.map(cat => {
                if (cat.title === 'Service Articles') {
                    return { ...cat, itemsCount: nextCount, progress: (nextCount / 10) * 100, limitRatio: `${nextCount}/10` };
                }
                return cat;
            }));
        }

        setIsArticlesModalOpen(false);
        setArticleTitle('');
        setArticleFile(null);
    };

    const filteredFiles = files.filter(f => {
        const matchesCategory = selectedCategory ? f.category === selectedCategory : true;
        const matchesSearch = searchQuery.trim() ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true;
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="file-cabinet-wrapper" ref={dropdownRef}>
            {/* ================================================================= */}
            {/* TOP ACTION TOOLBAR                                                */}
            {/* ================================================================= */}
            <div className="fc-toolbar">
                {/* Date Dropdown */}
                <div className="fc-dropdown-rel">
                    <button
                        type="button"
                        className="fc-filter-btn fc-date-btn"
                        onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
                    >
                        <div className="fc-date-btn-content">
                            <span>{selectedDate}</span>
                        </div>
                        <div className="fc-date-btn-actions">
                            <Star
                                size={14}
                                color={isStarred ? '#F59E0B' : '#9CA3AF'}
                                fill={isStarred ? '#F59E0B' : 'none'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsStarred(!isStarred);
                                }}
                                style={{ cursor: 'pointer' }}
                            />
                            <ChevronDown size={14} color="#6B7280" />
                        </div>
                    </button>

                    {openDropdown === 'date' && (
                        <div className="fc-dropdown-menu">
                            {dateOptions.map(d => (
                                <div
                                    key={d}
                                    className={`fc-menu-item ${selectedDate === d ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedDate(d);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <span>{d}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Owner Dropdown */}
                <div className="fc-dropdown-rel">
                    <button
                        type="button"
                        className="fc-filter-btn fc-owner-btn"
                        onClick={() => setOpenDropdown(openDropdown === 'owner' ? null : 'owner')}
                    >
                        <span>{selectedOwner}</span>
                        <ChevronDown size={14} color="#6B7280" />
                    </button>

                    {openDropdown === 'owner' && (
                        <div className="fc-dropdown-menu">
                            {ownerOptions.map(o => (
                                <div
                                    key={o}
                                    className={`fc-menu-item ${selectedOwner === o ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedOwner(o);
                                        setOpenDropdown(null);
                                    }}
                                >
                                    <span>{o}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filter Icon (Bare icon, 3 horizontal lines) */}
                <button
                    type="button"
                    className="fc-bare-filter-btn"
                    title="Filter files"
                >
                    <ListFilter size={20} color="#2563EB" />
                </button>

                {/* Refresh Button (Rounded square with light blue background) */}
                <button
                    type="button"
                    className={`fc-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                    onClick={handleRefresh}
                    title="Refresh"
                >
                    <RotateCw size={15} />
                </button>

                {/* Search files... */}
                <div className="fc-search-box">
                    <Search size={15} color="#9CA3AF" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Action Buttons in same row */}
                <button
                    type="button"
                    className="fc-action-btn fc-btn-chatbot-media"
                    onClick={() => setIsMediaModalOpen(true)}
                >
                    <Image size={16} />
                    <span>AI Chatbot Media</span>
                </button>

                <button
                    type="button"
                    className="fc-action-btn fc-btn-chatbot-articles"
                    onClick={() => setIsArticlesModalOpen(true)}
                >
                    <Bot size={17} />
                    <span>AI Chatbot Articles</span>
                </button>

                <button
                    type="button"
                    className="fc-action-btn fc-btn-upload"
                    onClick={() => directFileInputRef.current && directFileInputRef.current.click()}
                    title="Upload files from your computer"
                >
                    <FileUp size={16} strokeWidth={2.2} />
                    <span>Upload</span>
                </button>

                {/* Hidden File Picker to open file explorer directly */}
                <input
                    type="file"
                    ref={directFileInputRef}
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleDirectFileUpload}
                />

                <button
                    type="button"
                    className="fc-action-btn fc-btn-call"
                    onClick={() => setCurrentPage && setCurrentPage('Call Recordings')}
                >
                    <Headset size={16} />
                    <span>Call</span>
                </button>
            </div>

            {/* ================================================================= */}
            {/* FOLDER CATEGORY CARDS SECTION                                     */}
            {/* ================================================================= */}
            <div className="fc-cards-carousel-container">
                <div className="fc-cards-grid">
                    {categories.map(cat => {
                        const IconComponent = cat.icon;
                        const isSelected = selectedCategory === cat.title;

                        return (
                            <div
                                key={cat.id}
                                className={`fc-category-card ${cat.theme} ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    if (cat.title === 'Call Recordings' && setCurrentPage) {
                                        setCurrentPage('Call Recordings');
                                    } else {
                                        setSelectedCategory(isSelected ? null : cat.title);
                                    }
                                }}
                            >
                                <div className="fc-card-top">
                                    <div className="fc-card-top-left">
                                        <div className="fc-card-icon-badge">
                                            <IconComponent size={18} color={cat.color} />
                                        </div>
                                        <h4 className="fc-card-title">{cat.title}</h4>
                                    </div>
                                    <div className="fc-card-chevron">
                                        <ChevronRight size={16} color={cat.color} />
                                    </div>
                                </div>

                                <div className="fc-card-mid">
                                    <span className="fc-card-items-count">
                                        {cat.itemsCount} {cat.itemsCount === 1 ? 'Item' : 'Items'}
                                    </span>
                                    <div className="fc-card-progress-track">
                                        <div
                                            className="fc-card-progress-bar"
                                            style={{
                                                width: `${cat.progress}%`,
                                                backgroundColor: cat.color
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="fc-card-bottom">
                                    <span>{cat.storageUsed}</span>
                                    {cat.limitRatio && (
                                        <span className="fc-card-limit-ratio">{cat.limitRatio}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ================================================================= */}
            {/* RECENT FILES SECTION                                              */}
            {/* ================================================================= */}
            <div className="fc-recent-section">
                <div className="fc-recent-header">
                    <div className="fc-recent-title-group">
                        <h3 className="fc-recent-title">Recent Files</h3>
                        <p className="fc-recent-subtitle">
                            {selectedCategory
                                ? `Showing files for ${selectedCategory}`
                                : 'Showing 10 most recent files across all categories'}
                        </p>
                    </div>

                    <div className="fc-view-toggle">
                        <button
                            type="button"
                            className={`fc-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            type="button"
                            className={`fc-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <LayoutGrid size={20} />
                        </button>
                    </div>
                </div>

                {filteredFiles.length === 0 ? (
                    <div className="fc-empty-state">
                        <span>No files found</span>
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="fc-files-table-container">
                        <table className="fc-files-table">
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Category</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Owner</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFiles.map(file => (
                                    <tr key={file.id}>
                                        <td className="fc-file-name-cell">
                                            <File size={16} color="#6B7280" />
                                            <span>{file.name}</span>
                                        </td>
                                        <td>{file.category}</td>
                                        <td>{file.size}</td>
                                        <td>{file.date}</td>
                                        <td>{file.owner}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                type="button"
                                                className="fc-view-btn"
                                                onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                                                title="Delete File"
                                            >
                                                <Trash2 size={15} color="#EF4444" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="fc-files-grid-container">
                        {filteredFiles.map(file => (
                            <div key={file.id} className="fc-file-grid-card">
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Folder size={28} color="#3B82F6" />
                                    <button
                                        type="button"
                                        className="fc-view-btn"
                                        onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </button>
                                </div>
                                <div style={{ fontWeight: 500, fontSize: '13.5px', color: '#111827', wordBreak: 'break-all' }}>
                                    {file.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9CA3AF', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>{file.category}</span>
                                    <span>{file.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================================================================= */}
            {/* UPLOAD MODAL                                                      */}
            {/* ================================================================= */}
            {isUploadOpen && (
                <div className="fc-modal-overlay" onClick={() => setIsUploadOpen(false)}>
                    <div className="fc-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="fc-modal-header">
                            <h3>Upload New File</h3>
                            <button
                                type="button"
                                className="fc-modal-close-btn"
                                onClick={() => setIsUploadOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleFileUpload}>
                            <div className="fc-modal-body">
                                <div
                                    className="fc-dropzone"
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setUploadFile(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div className="fc-dropzone-icon">
                                        <Upload size={22} />
                                    </div>
                                    <p>
                                        {uploadFile
                                            ? `Selected: ${uploadFile.name}`
                                            : 'Click or drag files here to upload'}
                                    </p>
                                    <span>Supports Images, PDFs, Docs, Audio files up to 50MB</span>
                                </div>

                                <div className="fc-form-group">
                                    <label>Category</label>
                                    <select
                                        value={uploadCategory}
                                        onChange={(e) => setUploadCategory(e.target.value)}
                                    >
                                        <option value="Documents">Documents</option>
                                        <option value="Images">Images</option>
                                        <option value="Quotations">Quotations</option>
                                        <option value="Call Recordings">Call Recordings</option>
                                        <option value="Sales Articles">Sales Articles</option>
                                        <option value="Service Articles">Service Articles</option>
                                        <option value="Invoices">Invoices</option>
                                    </select>
                                </div>
                            </div>

                            <div className="fc-modal-footer">
                                <button
                                    type="button"
                                    className="fc-modal-cancel-btn"
                                    onClick={() => setIsUploadOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="fc-modal-submit-btn"
                                >
                                    Upload File
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* AI CHATBOT MEDIA MODAL                                            */}
            {/* ================================================================= */}
            {/* ================================================================= */}
            {/* AI CHATBOT MEDIA MODAL (Exact match to media_1790516001392.png)    */}
            {/* ================================================================= */}
            {isMediaModalOpen && (
                <div className="fc-modal-overlay" onClick={() => setIsMediaModalOpen(false)}>
                    <div className="fc-media-modal-dialog" onClick={e => e.stopPropagation()}>
                        {/* Header: Left Icon Badge + Title, Right Close X */}
                        <div className="fc-media-modal-header">
                            <div className="fc-media-header-left">
                                <div className="fc-media-icon-badge">
                                    <Images size={22} color="#00B589" />
                                </div>
                                <div className="fc-media-title-group">
                                    <h3 className="fc-media-modal-title">AI Chatbot Media</h3>
                                    <p className="fc-media-modal-subtitle">
                                        Upload Images or documents the AI chatbot can send to customers.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="fc-media-modal-close"
                                onClick={() => setIsMediaModalOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUploadChatbotMedia} className="fc-media-modal-form">
                            {/* Media Type Segment Selector */}
                            <div className="fc-media-form-section">
                                <label className="fc-media-label">Media Type</label>
                                <div className="fc-media-type-toggle">
                                    <button
                                        type="button"
                                        className={`fc-media-type-btn ${mediaType === 'image' ? 'active' : ''}`}
                                        onClick={() => setMediaType('image')}
                                    >
                                        <Image size={16} />
                                        <span>Image</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`fc-media-type-btn ${mediaType === 'document' ? 'active' : ''}`}
                                        onClick={() => setMediaType('document')}
                                    >
                                        <FileText size={16} />
                                        <span>Document (PDF)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Bot Usage Box */}
                            <div className="fc-media-usage-box">
                                <div className="fc-media-usage-top">
                                    <span className="fc-media-usage-title">
                                        {mediaType === 'image' ? 'Bot Images Usage' : 'Bot Documents Usage'}
                                    </span>
                                    <span className="fc-media-usage-badge">
                                        {mediaType === 'image' ? `${botImagesCount} / 10` : `${botDocsCount} / 10`}
                                    </span>
                                </div>
                                <div className="fc-media-usage-progress-track">
                                    <div
                                        className="fc-media-usage-progress-bar"
                                        style={{
                                            width: `${mediaType === 'image' ? (botImagesCount / 10) * 100 : (botDocsCount / 10) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Informational Tip Banner */}
                            <div className="fc-media-tip-banner">
                                <Lightbulb size={18} className="fc-tip-icon" />
                                <div className="fc-tip-text">
                                    <p>Use descriptive names so the AI can match them to queries.</p>
                                    <p className="fc-tip-examples">e.g. "pricing-guide.pdf", "product-demo.jpg"</p>
                                </div>
                            </div>

                            {/* Media Title Input */}
                            <div className="fc-media-form-section">
                                <label className="fc-media-label">Media Title</label>
                                <input
                                    type="text"
                                    className="fc-media-title-input"
                                    placeholder="e.g. product demo"
                                    value={mediaTitle}
                                    onChange={(e) => setMediaTitle(e.target.value)}
                                />
                            </div>

                            {/* Hidden File Picker */}
                            <input
                                type="file"
                                ref={chatbotFileInputRef}
                                style={{ display: 'none' }}
                                accept={mediaType === 'image' ? 'image/*' : '.pdf,application/pdf'}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setMediaFile(e.target.files[0]);
                                        if (!mediaTitle.trim()) {
                                            setMediaTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                                        }
                                    }
                                }}
                            />

                            {/* Action Submit Button */}
                            <button
                                type="submit"
                                className="fc-media-submit-btn"
                            >
                                {mediaType === 'image' ? (
                                    <ImagePlus size={18} strokeWidth={2.2} />
                                ) : (
                                    <FileUp size={18} strokeWidth={2.2} />
                                )}
                                <span>
                                    {mediaFile
                                        ? `Upload ${mediaFile.name}`
                                        : mediaType === 'image'
                                        ? 'Upload Image'
                                        : 'Upload Document'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================= */}
            {/* AI CHATBOT KNOWLEDGE BASE (ARTICLES) MODAL                         */}
            {/* Exact match to media_1790516244368.png                            */}
            {/* ================================================================= */}
            {isArticlesModalOpen && (
                <div className="fc-modal-overlay" onClick={() => setIsArticlesModalOpen(false)}>
                    <div className="fc-knowledge-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="fc-knowledge-modal-header">
                            <div className="fc-knowledge-header-left">
                                <div className="fc-knowledge-icon-badge">
                                    <Bot size={22} color="#2563EB" />
                                </div>
                                <h3 className="fc-knowledge-modal-title">AI Chatbot Knowledge Base</h3>
                            </div>
                            <button
                                type="button"
                                className="fc-knowledge-modal-close"
                                onClick={() => setIsArticlesModalOpen(false)}
                                title="Close"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form className="fc-knowledge-modal-form" onSubmit={handleUploadArticle}>
                            {/* Select Article Type */}
                            <div className="fc-article-form-section">
                                <label className="fc-article-label">Select Article Type</label>
                                <div className="fc-article-type-toggle">
                                    <button
                                        type="button"
                                        className={`fc-article-type-btn ${articleType === 'sales' ? 'active' : ''}`}
                                        onClick={() => setArticleType('sales')}
                                    >
                                        Sales Articles
                                    </button>
                                    <button
                                        type="button"
                                        className={`fc-article-type-btn ${articleType === 'service' ? 'active' : ''}`}
                                        onClick={() => setArticleType('service')}
                                    >
                                        Service Articles
                                    </button>
                                </div>
                            </div>

                            {/* Usage Box */}
                            <div className="fc-article-usage-box">
                                <div className="fc-article-usage-top">
                                    <span className="fc-article-usage-title">
                                        {articleType === 'sales' ? 'Sales Articles Usage' : 'Service Articles Usage'}
                                    </span>
                                    <span className="fc-article-usage-badge">
                                        {articleType === 'sales' ? salesArticlesCount : serviceArticlesCount} / 10
                                    </span>
                                </div>
                                <div className="fc-article-usage-progress-track">
                                    <div
                                        className="fc-article-usage-progress-bar"
                                        style={{
                                            width: `${((articleType === 'sales' ? salesArticlesCount : serviceArticlesCount) / 10) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Accepted Formats Banner */}
                            <div className="fc-article-format-banner">
                                <Info size={18} className="fc-format-info-icon" />
                                <div className="fc-format-text-wrapper">
                                    <div className="fc-format-main-text">
                                        <strong>Accepted formats:</strong> Word Document (.doc, .docx) only.
                                    </div>
                                    <div className="fc-format-sub-text">
                                        These documents will be used by the AI to answer customer queries.
                                    </div>
                                </div>
                            </div>

                            {/* Article Title Input */}
                            <div className="fc-article-form-section">
                                <label className="fc-article-label">Article Title</label>
                                <input
                                    type="text"
                                    className="fc-article-title-input"
                                    placeholder="Enter article title"
                                    value={articleTitle}
                                    onChange={(e) => setArticleTitle(e.target.value)}
                                />
                            </div>

                            {/* Hidden File Picker */}
                            <input
                                type="file"
                                ref={articleFileInputRef}
                                style={{ display: 'none' }}
                                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setArticleFile(e.target.files[0]);
                                        if (!articleTitle.trim()) {
                                            setArticleTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
                                        }
                                    }
                                }}
                            />

                            {/* Upload Document Button */}
                            <button
                                type="submit"
                                className="fc-article-submit-btn"
                            >
                                <CloudUpload size={18} strokeWidth={2.2} />
                                <span>
                                    {articleFile
                                        ? `Upload ${articleFile.name}`
                                        : 'Upload Document (.doc / .docx)'}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileCabinet;
