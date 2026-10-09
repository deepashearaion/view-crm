import React, { useState, useRef } from 'react';
import './ProductsServices.css';
import {
    Plus,
    Search,
    RotateCw,
    Image as ImageIcon,
    Archive,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    Wallet,
    Check,
    Package,
    Wrench
} from 'lucide-react';

const initialProductList = [
    // Page 1 (1 to 10)
    {
        id: 1,
        name: 'Bangalore to Goa Tw...',
        fullName: 'Bangalore to Goa Two Way',
        subtitle: 'Two Way Flight Ticket Cost ...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: '—',
        stock: '—',
        purchase: '—',
        sale: '₹7900.00',
        selling: '₹7900.00',
        tax: '—'
    },
    {
        id: 2,
        name: 'Dehi, Manali Agra Pa...',
        fullName: 'Dehi, Manali Agra Package',
        subtitle: '2 NightsDelhi, 2 Nights Ma...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹54000.00',
        selling: '₹52500.00',
        tax: '5.0%'
    },
    {
        id: 3,
        name: 'Delhi and Agra and m...',
        fullName: 'Delhi and Agra and more',
        subtitle: 'Delhi and agra sight seein...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: '—',
        stock: '—',
        purchase: '—',
        sale: '₹16900.00',
        selling: '₹14962.50',
        tax: '5.0%'
    },
    {
        id: 4,
        name: 'Delhi&Agra private p...',
        fullName: 'Delhi&Agra private package',
        subtitle: 'Delhi&Agra private packag...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: '—',
        stock: '—',
        purchase: '—',
        sale: '₹28000.00',
        selling: '₹27300.00',
        tax: '5.0%'
    },
    {
        id: 5,
        name: 'Golden Triangle Tour...',
        fullName: 'Golden Triangle Tour Package',
        subtitle: 'Delhi, Agra & Jaipur 5D/4N...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹32000.00',
        selling: '₹31000.00',
        tax: '5.0%'
    },
    {
        id: 6,
        name: 'Mumbai to Goa Cruise...',
        fullName: 'Mumbai to Goa Cruise Holiday',
        subtitle: 'Luxury cruise cabin & meals...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹45000.00',
        selling: '₹43500.00',
        tax: '5.0%'
    },
    {
        id: 7,
        name: 'Kerala Houseboat Stay...',
        fullName: 'Kerala Backwaters Houseboat Stay',
        subtitle: 'Alleppey luxury houseboat 2N...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹22000.00',
        selling: '₹21000.00',
        tax: '5.0%'
    },
    {
        id: 8,
        name: 'Kashmir Paradise Tour...',
        fullName: 'Kashmir Paradise Honeymoon Tour',
        subtitle: 'Srinagar, Gulmarg, Pahalgam...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹65000.00',
        selling: '₹62000.00',
        tax: '5.0%'
    },
    {
        id: 9,
        name: 'Dubai Extravaganza...',
        fullName: 'Dubai Extravaganza Package',
        subtitle: '5 Nights hotel, Burj Khalifa...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹85000.00',
        selling: '₹82500.00',
        tax: '5.0%'
    },
    {
        id: 10,
        name: 'Visa Consultation Fee...',
        fullName: 'Visa Assistance & Travel Insurance',
        subtitle: 'Document verification & guide...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹4500.00',
        selling: '₹4500.00',
        tax: '5.0%'
    },

    // Page 2 (11 to 20)
    {
        id: 11,
        name: 'Andaman Beach Getaway...',
        fullName: 'Andaman Island Beach Getaway',
        subtitle: 'Port Blair & Havelock 4N/5D...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹38000.00',
        selling: '₹36500.00',
        tax: '5.0%'
    },
    {
        id: 12,
        name: 'Ooty & Kodaikanal Tour...',
        fullName: 'Ooty & Kodaikanal Hill Station Tour',
        subtitle: 'Nilgiri toy train, lake & tea...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹18500.00',
        selling: '₹17200.00',
        tax: '5.0%'
    },
    {
        id: 13,
        name: 'Singapore Sentosa Adv...',
        fullName: 'Singapore Sentosa Island Adventure',
        subtitle: 'Universal Studios & Marina Bay...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹72000.00',
        selling: '₹69900.00',
        tax: '5.0%'
    },
    {
        id: 14,
        name: 'Thailand Bangkok Tour...',
        fullName: 'Thailand Bangkok & Pattaya Tour',
        subtitle: 'Coral Island speedboat & safari...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹34000.00',
        selling: '₹32500.00',
        tax: '5.0%'
    },
    {
        id: 15,
        name: 'Maldives Overwater Villa...',
        fullName: 'Maldives Overwater Villa Package',
        subtitle: '3N Water bungalow all-inclusive...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹115000.00',
        selling: '₹108000.00',
        tax: '5.0%'
    },
    {
        id: 16,
        name: 'Jaipur Heritage Walk...',
        fullName: 'Jaipur Heritage Forts & Palaces',
        subtitle: 'Amer Fort, Hawa Mahal & Jal Mahal...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹14000.00',
        selling: '₹13200.00',
        tax: '5.0%'
    },
    {
        id: 17,
        name: 'Leh Ladakh Expedition...',
        fullName: 'Leh Ladakh Bike Expedition Tour',
        subtitle: 'Khardung La, Pangong & Nubra 6N...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹42000.00',
        selling: '₹39900.00',
        tax: '5.0%'
    },
    {
        id: 18,
        name: 'Varanasi Spiritual Tour...',
        fullName: 'Varanasi Spiritual Ganga Aarti Tour',
        subtitle: 'Kashi Vishwanath, Sarnath & Ghat...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹12500.00',
        selling: '₹11800.00',
        tax: '5.0%'
    },
    {
        id: 19,
        name: 'Coorg Coffee Estate Stay...',
        fullName: 'Coorg Coffee Plantation Stay',
        subtitle: 'Luxury plantation cottage & trek...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹16000.00',
        selling: '₹15200.00',
        tax: '5.0%'
    },
    {
        id: 20,
        name: 'Bali Tropical Honeymoon...',
        fullName: 'Bali Tropical Honeymoon Package',
        subtitle: 'Ubud private pool villa & swing...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹58000.00',
        selling: '₹55000.00',
        tax: '5.0%'
    },

    // Page 3 (21 to 30)
    {
        id: 21,
        name: 'Darjeeling & Gangtok...',
        fullName: 'Darjeeling & Gangtok Explorer',
        subtitle: 'Tiger Hill sunrise & monastery...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹26000.00',
        selling: '₹24800.00',
        tax: '5.0%'
    },
    {
        id: 22,
        name: 'Rishikesh River Rafting...',
        fullName: 'Rishikesh River Rafting Weekend',
        subtitle: 'Cliff jumping & luxury camping...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹8500.00',
        selling: '₹7999.00',
        tax: '5.0%'
    },
    {
        id: 23,
        name: 'Sri Lanka Triangle Tour...',
        fullName: 'Sri Lanka Cultural Triangle Tour',
        subtitle: 'Kandy, Sigiriya & Nuwara Eliya...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹48000.00',
        selling: '₹45500.00',
        tax: '5.0%'
    },
    {
        id: 24,
        name: 'Shimla Snow Valley Tour...',
        fullName: 'Shimla Snow Valley Holiday',
        subtitle: 'Mall Road, Kufri ski resort & snow...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹19500.00',
        selling: '₹18200.00',
        tax: '5.0%'
    },
    {
        id: 25,
        name: 'Hyderabad Heritage Walk...',
        fullName: 'Hyderabad Nizam Heritage Walk',
        subtitle: 'Charminar, Golconda & biryani...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹3500.00',
        selling: '₹3200.00',
        tax: '5.0%'
    },
    {
        id: 26,
        name: 'Udaipur Royal Palace...',
        fullName: 'Udaipur Royal Palace Experience',
        subtitle: 'Lake Pichola boat ride & Jag Mandir...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹31000.00',
        selling: '₹29500.00',
        tax: '5.0%'
    },
    {
        id: 27,
        name: 'Pondicherry French Tour...',
        fullName: 'Pondicherry French Colony Tour',
        subtitle: 'Auroville & Promenade Beach 3D...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹11500.00',
        selling: '₹10800.00',
        tax: '5.0%'
    },
    {
        id: 28,
        name: 'Mysore Heritage & Gardens...',
        fullName: 'Mysore Palace & Chamundi Hills',
        subtitle: 'Royal heritage tour & Brindavan...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹9500.00',
        selling: '₹8900.00',
        tax: '5.0%'
    },
    {
        id: 29,
        name: 'Vietnam Halong Bay Cruise...',
        fullName: 'Vietnam Hanoi & Halong Bay Tour',
        subtitle: 'Overnight luxury cruise & cave...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹52000.00',
        selling: '₹49500.00',
        tax: '5.0%'
    },
    {
        id: 30,
        name: 'Kaziranga Safari Package...',
        fullName: 'Kaziranga Wildlife Safari Tour',
        subtitle: 'One-horned rhino elephant safari...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹24000.00',
        selling: '₹22900.00',
        tax: '5.0%'
    },

    // Page 4 (31 to 40)
    {
        id: 31,
        name: 'Meghalaya Living Bridges...',
        fullName: 'Meghalaya Living Root Bridges Tour',
        subtitle: 'Cherrapunji & Dawki crystal river...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹27500.00',
        selling: '₹26000.00',
        tax: '5.0%'
    },
    {
        id: 32,
        name: 'Rann of Kutch Desert...',
        fullName: 'Rann of Kutch White Desert Festival',
        subtitle: 'Full moon tent city & cultural dance...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹29000.00',
        selling: '₹27500.00',
        tax: '5.0%'
    },
    {
        id: 33,
        name: 'Bhutan Thunder Dragon...',
        fullName: 'Bhutan Land of Thunder Dragon',
        subtitle: 'Paro Tiger Nest monastery & Thimphu...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹62000.00',
        selling: '₹59000.00',
        tax: '5.0%'
    },
    {
        id: 34,
        name: 'Hampi Heritage Ruins Walk...',
        fullName: 'Hampi UNESCO Ruins Heritage Walk',
        subtitle: 'Vijayanagara empire temples & trek...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹4000.00',
        selling: '₹3800.00',
        tax: '5.0%'
    },
    {
        id: 35,
        name: 'Gokarna Beach Camping...',
        fullName: 'Gokarna Beach Trek & Camping',
        subtitle: 'Om beach, Kudle cliff camping & sunset...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹7500.00',
        selling: '₹6999.00',
        tax: '5.0%'
    },
    {
        id: 36,
        name: 'Nepal Himalayan Holiday...',
        fullName: 'Nepal Kathmandu & Pokhara Holiday',
        subtitle: 'Everest scenic flight & Phewa lake...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹33000.00',
        selling: '₹31500.00',
        tax: '5.0%'
    },
    {
        id: 37,
        name: 'Chikmagalur Peak Trek...',
        fullName: 'Chikmagalur Peak Trekking Camp',
        subtitle: 'Mullayanagiri peak trek & homestay...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹8900.00',
        selling: '₹8200.00',
        tax: '5.0%'
    },
    {
        id: 38,
        name: 'Ranthambore Tiger Safari...',
        fullName: 'Ranthambore Tiger Safari 3D/2N',
        subtitle: 'Zone 1-5 jungle safari canter...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹21000.00',
        selling: '₹19800.00',
        tax: '5.0%'
    },
    {
        id: 39,
        name: 'Jaisalmer Desert Camp...',
        fullName: 'Jodhpur & Jaisalmer Desert Camp',
        subtitle: 'Sam sand dunes camel safari & camp...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹23500.00',
        selling: '₹22000.00',
        tax: '5.0%'
    },
    {
        id: 40,
        name: 'Sundarbans Delta Cruise...',
        fullName: 'Sundarbans Mangrove Delta Cruise',
        subtitle: 'Royal Bengal tiger boat safari & tower...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹17500.00',
        selling: '₹16500.00',
        tax: '5.0%'
    },

    // Page 5 (41 to 43)
    {
        id: 41,
        name: 'Tirupati Balaji Darshan...',
        fullName: 'Tirupati Balaji Special Darshan Tour',
        subtitle: 'VIP break darshan, laddu & AC cab...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹6500.00',
        selling: '₹5999.00',
        tax: '5.0%'
    },
    {
        id: 42,
        name: 'Madurai & Rameswaram...',
        fullName: 'Madurai & Rameswaram Temple Yatra',
        subtitle: 'Meenakshi Amman, Pamban bridge...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹15500.00',
        selling: '₹14500.00',
        tax: '5.0%'
    },
    {
        id: 43,
        name: 'Ajanta & Ellora Caves...',
        fullName: 'Ajanta & Ellora Caves Heritage Tour',
        subtitle: 'Ancient rock-cut cave monuments guide...',
        type: 'Product',
        category: '—',
        sku: '—',
        unit: 'Set',
        stock: '—',
        purchase: '—',
        sale: '₹5500.00',
        selling: '₹5200.00',
        tax: '5.0%'
    }
];

const ProductsServices = () => {
    const [items, setItems] = useState(initialProductList);
    const [activeTab, setActiveTab] = useState('All'); // 'All', 'Products', 'Services'
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Touch swipe gesture state
    const [touchStartX, setTouchStartX] = useState(null);

    // Toast notification
    const [toastMessage, setToastMessage] = useState('');

    // File input ref for product image upload
    const fileInputRef = useRef(null);

    // New item form state matching New Product modal
    const [newItem, setNewItem] = useState({
        image: null,
        type: 'Product', // 'Product' | 'Service'
        category: '',
        name: '',
        description: '',
        sku: '',
        purchasePrice: '',
        salePrice: '',
        discount: '',
        discountType: '%', // '%' | '₹'
        tax: '0%',
        taxType: '%', // '%' | '₹'
        unit: '',
        stockQuantity: ''
    });

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const calculateSellingPrice = () => {
        const sale = parseFloat(newItem.salePrice);
        if (isNaN(sale) || sale <= 0) return '';
        const disc = parseFloat(newItem.discount);
        if (isNaN(disc) || disc <= 0) return sale.toFixed(2);

        let calculated = sale;
        if (newItem.discountType === '%') {
            calculated = sale - (sale * (disc / 100));
        } else {
            calculated = sale - disc;
        }
        return Math.max(0, calculated).toFixed(2);
    };

    const calculateStockValue = () => {
        const stock = parseFloat(newItem.stockQuantity);
        const purchase = parseFloat(newItem.purchasePrice);
        if (isNaN(stock) || isNaN(purchase)) return '';
        return (stock * purchase).toFixed(2);
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 600);
    };

    const handleSaveNewItem = (e) => {
        e.preventDefault();

        const nameVal = newItem.name.trim() || (newItem.type === 'Product' ? 'Bangalore to Goa Tour Package' : 'Tour Guide & Consultation');
        const subtitleVal = newItem.description.trim() || (newItem.type === 'Product' ? 'Two Way Flight Ticket Cost Included' : 'Professional guided itinerary & consultation');
        const saleNum = parseFloat(newItem.salePrice) || 7900;
        const saleVal = `₹${saleNum.toFixed(2)}`;
        
        const calculatedSelling = calculateSellingPrice();
        const sellingVal = calculatedSelling ? `₹${parseFloat(calculatedSelling).toFixed(2)}` : (newItem.salePrice ? `₹${parseFloat(newItem.salePrice).toFixed(2)}` : '₹7900.00');

        const unitVal = newItem.unit.trim() || (newItem.type === 'Product' ? 'Set' : '—');
        const taxVal = newItem.tax || '0%';
        const purchaseVal = newItem.purchasePrice ? `₹${parseFloat(newItem.purchasePrice).toFixed(2)}` : '—';
        const stockVal = newItem.stockQuantity ? newItem.stockQuantity : '—';
        const skuVal = newItem.sku ? newItem.sku : '—';
        const categoryVal = newItem.category || (newItem.type === 'Product' ? 'Tour Packages' : 'Travel Service');

        const created = {
            id: Date.now(),
            name: nameVal.length > 22 ? `${nameVal.slice(0, 20)}...` : nameVal,
            fullName: nameVal,
            subtitle: subtitleVal.length > 28 ? `${subtitleVal.slice(0, 27)}...` : subtitleVal,
            type: newItem.type,
            category: categoryVal,
            sku: skuVal,
            unit: unitVal,
            stock: stockVal,
            purchase: purchaseVal,
            sale: saleVal,
            selling: sellingVal,
            tax: taxVal,
            image: newItem.image || null
        };

        setItems(prev => [created, ...prev]);
        setIsModalOpen(false);
        setCurrentPage(1); // Jump to first page to see the new item immediately

        // Trigger success toast notification
        setToastMessage(`Product "${nameVal}" added successfully!`);
        setTimeout(() => {
            setToastMessage('');
        }, 3200);

        // Reset form
        setNewItem({
            image: null,
            type: 'Product',
            category: '',
            name: '',
            description: '',
            sku: '',
            purchasePrice: '',
            salePrice: '',
            discount: '',
            discountType: '%',
            tax: '0%',
            taxType: '%',
            unit: '',
            stockQuantity: ''
        });
    };

    // Filter by tab and search
    const filteredItems = items.filter(item => {
        const matchesTab = activeTab === 'All'
            ? true
            : activeTab === 'Products'
            ? item.type === 'Product'
            : item.type === 'Service';

        const matchesSearch = searchQuery.trim() === ''
            ? true
            : item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredItems.length / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredItems.length);
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Touch Swipe Handlers
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e) => {
        if (touchStartX === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX - touchEndX;

        // Swiped left (next)
        if (diff > 50) {
            handleNextPage();
        }
        // Swiped right (prev)
        else if (diff < -50) {
            handlePrevPage();
        }
        setTouchStartX(null);
    };

    return (
        <div className="ps-page-wrapper">
            {/* ROW 1: Tabs, Search Box, and New Product / Service Button */}
            <div className="ps-top-controls-row">
                <div className="ps-controls-left">
                    <div className="ps-filter-pills">
                        <button
                            type="button"
                            className={`ps-pill-tab ${activeTab === 'All' ? 'active' : ''}`}
                            onClick={() => handleTabChange('All')}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`ps-pill-tab ${activeTab === 'Products' ? 'active' : ''}`}
                            onClick={() => handleTabChange('Products')}
                        >
                            Products
                        </button>
                        <button
                            type="button"
                            className={`ps-pill-tab ps-services-pill ${activeTab === 'Services' ? 'active' : ''}`}
                            onClick={() => handleTabChange('Services')}
                        >
                            Services
                        </button>
                    </div>

                    <div className="ps-search-container">
                        <Search size={15} />
                        <input
                            type="text"
                            className="ps-search-field"
                            placeholder="Search products & services..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className="ps-btn-new-item"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} strokeWidth={2.4} />
                    <span>New Product / Service</span>
                </button>
            </div>

            {/* ROW 2: Stock Badges and Refresh Button */}
            <div className="ps-sub-controls-row">
                <div className="ps-stock-badges">
                    <div className="ps-stock-badge ps-badge-stock-count">
                        <div className="ps-badge-icon-box">
                            <Archive size={12} strokeWidth={2.4} />
                        </div>
                        <span>Total Available Stock <strong className="ps-badge-val">0</strong></span>
                    </div>

                    <div className="ps-stock-badge ps-badge-stock-value">
                        <div className="ps-badge-icon-box">
                            <Wallet size={12} strokeWidth={2.4} />
                        </div>
                        <span>Total Stock Value <strong className="ps-badge-val">₹0.00</strong></span>
                    </div>
                </div>

                <button
                    type="button"
                    className={`ps-table-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                    onClick={handleRefresh}
                    title="Refresh data"
                >
                    <RotateCw size={16} />
                </button>
            </div>

            {/* ROW 3: Table Card with Swipe Listeners */}
            <div
                className="ps-card-table"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className="ps-table-responsive">
                    <table className="ps-data-table">
                        <thead>
                            <tr>
                                <th className="ps-col-num">#</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>SKU</th>
                                <th>Unit</th>
                                <th>Stock</th>
                                <th>Purchase</th>
                                <th>Sale</th>
                                <th>Selling</th>
                                <th>Tax %</th>
                                <th style={{ textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="ps-empty-table-cell">
                                        <div className="ps-empty-state-container">
                                            <div className="ps-empty-state-box-icon">
                                                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                    {/* Box Lid */}
                                                    <rect x="3" y="3" width="18" height="4.5" rx="1.5" />
                                                    {/* Box Body */}
                                                    <path d="M4.5 7.5v11.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7.5" />
                                                    {/* Box Handle Slot */}
                                                    <line x1="9.5" y1="12" x2="14.5" y2="12" strokeWidth="2.4" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                            <h4 className="ps-empty-state-title">No products or services found</h4>
                                            <p className="ps-empty-state-sub">Click "New Product / Service" to add your first item</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item, index) => {
                                    // Row index starts from 1 on Page 1, 11 on Page 2, 21 on Page 3, etc.
                                    const rowNumber = startIndex + index + 1;

                                    return (
                                        <tr key={item.id}>
                                            <td className="ps-col-num">{rowNumber}</td>
                                            <td>
                                                <div className="ps-cell-name">
                                                    <div className="ps-thumbnail-placeholder">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.fullName} className="ps-table-thumb-preview" />
                                                        ) : (
                                                            <ImageIcon size={16} />
                                                        )}
                                                    </div>
                                                    <div className="ps-name-text-group">
                                                        <span className="ps-item-primary-title" title={item.fullName}>
                                                            {item.name}
                                                        </span>
                                                        <span className="ps-item-subtitle" title={item.subtitle}>
                                                            {item.subtitle}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`ps-type-badge ${item.type.toLowerCase()}`}>
                                                    <Archive size={11} strokeWidth={2.2} />
                                                    <span>{item.type}</span>
                                                </span>
                                            </td>
                                            <td>{item.category}</td>
                                            <td>{item.sku}</td>
                                            <td>{item.unit}</td>
                                            <td>{item.stock}</td>
                                            <td>{item.purchase}</td>
                                            <td className="ps-price-sale">{item.sale}</td>
                                            <td className="ps-price-selling">{item.selling}</td>
                                            <td>{item.tax}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    className="ps-row-action-btn"
                                                    title="More options"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ROW 4: Pagination Footer matching screenshot */}
                <div className="ps-pagination-bar">
                    <div className="ps-pagination-left">
                        <span className="ps-page-info">
                            Showing {filteredItems.length > 0 ? startIndex + 1 : 0} to {filteredItems.length > 0 ? endIndex : 0} of {filteredItems.length} products
                        </span>
                        <div className="ps-rows-per-page">
                            <span>Rows per page:</span>
                            <span style={{ fontWeight: 600, color: '#0F172A', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                {rowsPerPage} <ChevronDown size={14} color="#64748B" />
                            </span>
                        </div>
                    </div>

                    <div className="ps-pagination-controls">
                        <button
                            type="button"
                            className="ps-page-btn"
                            disabled={currentPage === 1 || filteredItems.length === 0}
                            onClick={handlePrevPage}
                            title="Previous page"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="ps-page-pill">
                            {filteredItems.length === 0 ? '1 / 1' : `${currentPage} / ${totalPages}`}
                        </span>

                        <button
                            type="button"
                            className="ps-page-btn"
                            disabled={currentPage === totalPages || filteredItems.length === 0}
                            onClick={handleNextPage}
                            title="Next page"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal: New Product / Service */}
            {isModalOpen && (
                <div className="ps-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="ps-modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="ps-modal-head">
                            <h3>New Product</h3>
                            <button
                                type="button"
                                className="ps-modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNewItem} className="ps-modal-form-wrapper">
                            <div className="ps-modal-body-scrollable">
                                {/* Product Image Dropzone */}
                                <div className="ps-field-group">
                                    <label className="ps-field-label">Product Image</label>
                                    <div
                                        className="ps-image-upload-dropzone"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />
                                        {newItem.image ? (
                                            <div className="ps-image-preview-wrapper" onClick={(e) => e.stopPropagation()}>
                                                <img src={newItem.image} alt="Product Preview" className="ps-image-preview-thumb" />
                                                <div className="ps-image-preview-actions">
                                                    <button
                                                        type="button"
                                                        className="ps-change-img-btn"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        Change Image
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="ps-remove-img-btn"
                                                        onClick={() => setNewItem(prev => ({ ...prev, image: null }))}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="ps-image-upload-content">
                                                <div className="ps-image-upload-icon-circle">
                                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                                                        <circle cx="9" cy="9" r="2"/>
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                                                        <path d="M16 5h6"/>
                                                        <path d="M19 2v6"/>
                                                    </svg>
                                                </div>
                                                <span className="ps-image-upload-title">Click to upload product image</span>
                                                <span className="ps-image-upload-sub">PNG, JPG up to 5 MB</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Type* & Category* */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Type*</label>
                                        <div className="ps-type-segmented-box">
                                            <button
                                                type="button"
                                                className={`ps-type-btn ${newItem.type === 'Product' ? 'active' : ''}`}
                                                onClick={() => setNewItem({ ...newItem, type: 'Product' })}
                                            >
                                                <Package size={16} />
                                                <span>Product</span>
                                            </button>
                                            <button
                                                type="button"
                                                className={`ps-type-btn ${newItem.type === 'Service' ? 'active' : ''}`}
                                                onClick={() => setNewItem({ ...newItem, type: 'Service' })}
                                            >
                                                <Wrench size={15} />
                                                <span>Service</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Category*</label>
                                        <div className="ps-select-wrapper">
                                            <select
                                                className="ps-input-field ps-select-field"
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option value="" disabled>Select or create category</option>
                                                <option value="Tour Packages">Tour Packages</option>
                                                <option value="Flight Tickets">Flight Tickets</option>
                                                <option value="Hotel Accommodations">Hotel Accommodations</option>
                                                <option value="Sightseeing & Activities">Sightseeing & Activities</option>
                                                <option value="Visa & Documentation">Visa & Documentation</option>
                                                <option value="Transport & Transfers">Transport & Transfers</option>
                                            </select>
                                            <ChevronDown size={17} className="ps-select-chevron" />
                                        </div>
                                    </div>
                                </div>

                                {/* Product Name* */}
                                <div className="ps-field-group">
                                    <label className="ps-field-label">Product Name*</label>
                                    <input
                                        type="text"
                                        className="ps-input-field"
                                        placeholder="Enter product name"
                                        maxLength={90}
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                    <div className="ps-char-count">{newItem.name.length}/90</div>
                                </div>

                                {/* Description & SKU / Code */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Description</label>
                                        <input
                                            type="text"
                                            className="ps-input-field"
                                            placeholder="Enter description"
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">SKU / Code</label>
                                        <input
                                            type="text"
                                            className="ps-input-field"
                                            placeholder="Enter SKU"
                                            value={newItem.sku}
                                            onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Purchase Price* & Sale Price* */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Purchase Price*</label>
                                        <input
                                            type="number"
                                            className="ps-input-field"
                                            placeholder="Enter purchase price"
                                            value={newItem.purchasePrice}
                                            onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                                        />
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Sale Price*</label>
                                        <input
                                            type="number"
                                            className="ps-input-field"
                                            placeholder="Enter sale price"
                                            value={newItem.salePrice}
                                            onChange={(e) => setNewItem({ ...newItem, salePrice: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Discount & Selling Price* */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <div className="ps-label-with-toggle">
                                            <span className="ps-field-label">Discount</span>
                                            <div className="ps-pill-toggle">
                                                <button
                                                    type="button"
                                                    className={`ps-pill-btn ${newItem.discountType === '%' ? 'active' : ''}`}
                                                    onClick={() => setNewItem({ ...newItem, discountType: '%' })}
                                                >
                                                    %
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`ps-pill-btn ${newItem.discountType === '₹' ? 'active' : ''}`}
                                                    onClick={() => setNewItem({ ...newItem, discountType: '₹' })}
                                                >
                                                    ₹
                                                </button>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            className="ps-input-field"
                                            placeholder={newItem.discountType === '%' ? 'Enter discount %' : 'Enter discount ₹'}
                                            value={newItem.discount}
                                            onChange={(e) => setNewItem({ ...newItem, discount: e.target.value })}
                                        />
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Selling Price*</label>
                                        <input
                                            type="text"
                                            className="ps-input-field ps-readonly-field"
                                            placeholder="Auto-calculated"
                                            value={calculateSellingPrice() ? `₹${calculateSellingPrice()}` : ''}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Tax & Unit (Optional) */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <div className="ps-label-with-toggle">
                                            <span className="ps-field-label">Tax</span>
                                            <div className="ps-pill-toggle">
                                                <button
                                                    type="button"
                                                    className={`ps-pill-btn ${newItem.taxType === '%' ? 'active' : ''}`}
                                                    onClick={() => setNewItem({ ...newItem, taxType: '%' })}
                                                >
                                                    %
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`ps-pill-btn ${newItem.taxType === '₹' ? 'active' : ''}`}
                                                    onClick={() => setNewItem({ ...newItem, taxType: '₹' })}
                                                >
                                                    ₹
                                                </button>
                                            </div>
                                        </div>
                                        <div className="ps-select-wrapper">
                                            <select
                                                className="ps-input-field ps-select-field"
                                                value={newItem.tax}
                                                onChange={(e) => setNewItem({ ...newItem, tax: e.target.value })}
                                            >
                                                <option value="0%">0%</option>
                                                <option value="5.0%">5%</option>
                                                <option value="12.0%">12%</option>
                                                <option value="18.0%">18%</option>
                                                <option value="28.0%">28%</option>
                                            </select>
                                            <ChevronDown size={17} className="ps-select-chevron" />
                                        </div>
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Unit (Optional)</label>
                                        <div className="ps-select-wrapper">
                                            <select
                                                className="ps-input-field ps-select-field"
                                                value={newItem.unit}
                                                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                            >
                                                <option value="" disabled>Select or type unit</option>
                                                <option value="Set">Set</option>
                                                <option value="Pcs">Pcs</option>
                                                <option value="Trip">Trip</option>
                                                <option value="Day">Day</option>
                                                <option value="Person">Person</option>
                                                <option value="Box">Box</option>
                                                <option value="Hours">Hours</option>
                                            </select>
                                            <ChevronDown size={17} className="ps-select-chevron" />
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Quantity & Stock Value */}
                                <div className="ps-grid-2col">
                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Stock Quantity</label>
                                        <input
                                            type="number"
                                            className="ps-input-field"
                                            placeholder="Enter available stock"
                                            value={newItem.stockQuantity}
                                            onChange={(e) => setNewItem({ ...newItem, stockQuantity: e.target.value })}
                                        />
                                    </div>

                                    <div className="ps-field-group">
                                        <label className="ps-field-label">Stock Value</label>
                                        <input
                                            type="text"
                                            className="ps-input-field ps-readonly-field"
                                            placeholder="Stock x Purchase price"
                                            value={calculateStockValue() ? `₹${calculateStockValue()}` : ''}
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer inside scrollable body */}
                                <div className="ps-modal-foot">
                                    <button
                                        type="button"
                                        className="ps-cancel-modal-btn"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ps-save-modal-btn"
                                    >
                                        {newItem.type === 'Service' ? 'Save Service' : 'Save Product'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Toast Notification */}
            {toastMessage && (
                <div className="ps-toast">
                    <div className="ps-toast-icon">
                        <Check size={16} strokeWidth={2.5} />
                    </div>
                    <span>{toastMessage}</span>
                </div>
            )}
        </div>
    );
};

export default ProductsServices;
