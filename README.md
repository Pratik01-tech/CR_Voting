# Online Voting System

A comprehensive, secure, and user-friendly online voting system built with PHP, MySQL, HTML, CSS, and JavaScript. This system provides a modern interface for conducting elections with real-time updates and comprehensive admin controls.

## 🚀 Features

### User Features
- **User Registration & Login**: Secure authentication with mobile number and password
- **Voter Card Upload**: Support for voter identification documents
- **Candidate Selection**: Intuitive voting interface with radio button selection
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Mobile-friendly interface that works on all devices

### Admin Features
- **Dashboard Analytics**: Real-time metrics including total users, votes, and current winner
- **Voting Control**: Start/stop voting rounds with admin controls
- **Candidate Management**: Add, edit, and manage candidates
- **User Management**: View and manage registered users
- **System Reset**: Reset voting system for new rounds
- **Data Management**: Clear all data with safety confirmations

### Security Features
- **Password Hashing**: Secure password storage using bcrypt
- **Session Management**: Secure session handling and validation
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Protection**: Prepared statements for all database queries
- **File Upload Security**: Secure file handling with type and size validation

## 🛠️ Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Icons**: Font Awesome 6.0
- **Security**: bcrypt password hashing, prepared statements

## 📋 Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser with JavaScript enabled

## 🚀 Installation

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE online_voting_system;
```

2. Import the database schema:
```bash
mysql -u username -p online_voting_system < database.sql
```

3. Update database configuration in `config/database.php`:
```php
private $host = 'localhost';
private $db_name = 'online_voting_system';
private $username = 'your_username';
private $password = 'your_password';
```

### 2. File Uploads

Create the uploads directory and set permissions:
```bash
mkdir -p uploads/voter_cards
chmod 755 uploads/voter_cards
```

### 3. Web Server Configuration

Ensure your web server is configured to:
- Execute PHP files
- Handle file uploads (check `upload_max_filesize` and `post_max_size` in php.ini)
- Support sessions

### 4. Access the System

- **Main Page**: `http://yourdomain.com/index.php`
- **Admin Panel**: Login with admin credentials from the database

## 🔐 Default Admin Credentials

The system comes with a default admin account:
- **Admin ID**: `admin`
- **Password**: `password` (hashed in database)

**Important**: Change the default password after first login!

## 📱 Usage

### For Voters

1. **Register**: Create an account with full name, mobile number, and password
2. **Login**: Use mobile number and password to access the system
3. **Vote**: Select your preferred candidate and submit your vote
4. **View Results**: See current winner and voting statistics

### For Administrators

1. **Login**: Access admin panel with admin credentials
2. **Start Voting**: Activate the voting system for users
3. **Monitor**: View real-time metrics and user activity
4. **Manage**: Add candidates, manage users, and control system settings
5. **End Voting**: Close voting rounds and calculate results

## 🎨 Customization

### Styling
- Modify `assets/css/style.css` for main styling
- Edit `assets/css/voting.css` for voting page styles
- Update `assets/css/admin.css` for admin dashboard styles

### Functionality
- Extend JavaScript functionality in `assets/js/` files
- Modify PHP backend scripts in respective directories
- Add new features by extending the existing architecture

## 🔒 Security Considerations

- **Password Policy**: Implement strong password requirements
- **Rate Limiting**: Add rate limiting for login attempts
- **HTTPS**: Use HTTPS in production for secure data transmission
- **Regular Updates**: Keep PHP and dependencies updated
- **Backup**: Regular database and file backups

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check database credentials in `config/database.php`
   - Ensure MySQL service is running
   - Verify database exists

2. **File Upload Issues**
   - Check `uploads/` directory permissions
   - Verify PHP upload settings in `php.ini`
   - Check file size limits

3. **Session Issues**
   - Ensure sessions are enabled in PHP
   - Check session directory permissions
   - Verify session configuration

### Debug Mode

Enable error reporting in PHP for development:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## 📊 Database Schema

The system includes the following tables:
- `users`: User accounts and authentication
- `candidates`: Candidate information and details
- `votes`: Voting records and timestamps
- `system_settings`: System configuration and statistics

## 🔄 API Endpoints

The system provides several API endpoints for AJAX operations:
- `auth/register.php`: User registration
- `auth/login.php`: User authentication
- `auth/admin_login.php`: Admin authentication
- `voting/submit_vote.php`: Vote submission
- `admin/actions/*.php`: Admin operations

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For support and questions:
1. Check the troubleshooting section
2. Review the code comments
3. Open an issue on the project repository

## 🔮 Future Enhancements

- **Email Verification**: Add email verification for user accounts
- **Two-Factor Authentication**: Implement 2FA for admin accounts
- **Audit Logging**: Comprehensive activity logging
- **API Documentation**: Complete API documentation
- **Mobile App**: Native mobile application
- **Real-time Results**: Live result updates with charts
- **Multi-language Support**: Internationalization support

---

**Note**: This system is designed for educational and small-scale voting purposes. For production use in critical elections, additional security measures and compliance checks should be implemented.
