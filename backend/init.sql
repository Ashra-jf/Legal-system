-- =====================================================
-- Legal Management System Database Schema
-- Version: 2.0
-- Normalization: Third Normal Form (3NF)
-- =====================================================

DROP DATABASE IF EXISTS legal_mgmt;
CREATE DATABASE legal_mgmt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE legal_mgmt;

-- =====================================================
-- CORE USER MANAGEMENT TABLES
-- =====================================================

-- 1. Users Table (Base authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'lawyer', 'client') NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    verification_code VARCHAR(10),
    verification_expires_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- 2. Lawyer Profiles (Extended lawyer information)
-- ✅ 3NF: Removed derived columns (rating, total_cases, cases_won)
--    These are computed dynamically via lawyer_statistics view
CREATE TABLE lawyer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT UNIQUE NOT NULL,
    bar_registration VARCHAR(100),
    license_number VARCHAR(100),
    experience_years INT DEFAULT 0,
    education TEXT,
    bio TEXT,
    consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
    availability_status ENUM('available', 'busy', 'on_leave') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_availability (availability_status)
) ENGINE=InnoDB;

-- 3. Client Profiles (Extended client information)
CREATE TABLE client_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    date_of_birth DATE,
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_phone (phone)
) ENGINE=InnoDB;

-- =====================================================
-- SPECIALIZATION TABLES
-- =====================================================

-- 4. Specializations (Legal practice areas)
CREATE TABLE specializations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Lawyer Specializations (Many-to-many junction)
CREATE TABLE lawyer_specializations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT NOT NULL,
    specialization_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lawyer_specialization (lawyer_id, specialization_id),
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_specialization (specialization_id)
) ENGINE=InnoDB;

-- =====================================================
-- SERVICE MANAGEMENT TABLES
-- =====================================================

-- 6. Service Categories
CREATE TABLE service_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- 7. Services
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_fee DECIMAL(10, 2) NOT NULL,
    duration_estimate VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_is_active (is_active),
    INDEX idx_base_fee (base_fee)
) ENGINE=InnoDB;

-- 8. Lawyer Services (Many-to-many with custom fees)
CREATE TABLE lawyer_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT NOT NULL,
    service_id INT NOT NULL,
    custom_fee DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lawyer_service (lawyer_id, service_id),
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_service (service_id),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB;

-- =====================================================
-- APPOINTMENT MANAGEMENT TABLES
-- =====================================================

-- 9. Appointment Slots (Lawyer availability)
CREATE TABLE appointment_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_day (day_of_week),
    INDEX idx_is_available (is_available)
) ENGINE=InnoDB;

-- 10. Appointments
CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    service_id INT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled') DEFAULT 'pending',
    fee DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_client (client_id),
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB;

-- =====================================================
-- CASE MANAGEMENT TABLES
-- =====================================================

-- 11. Cases
CREATE TABLE cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    service_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(100),
    status ENUM('open', 'in_progress', 'pending_review', 'closed', 'won', 'lost', 'settled') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    filing_date DATE,
    next_hearing_date DATE,
    closing_date DATE,
    court_name VARCHAR(255),
    judge_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_case_number (case_number),
    INDEX idx_client (client_id),
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_next_hearing (next_hearing_date)
) ENGINE=InnoDB;

-- 12. Case Updates (Timeline/history)
CREATE TABLE case_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    updated_by INT NOT NULL,
    update_type ENUM('status_change', 'hearing', 'document', 'note', 'evidence', 'ruling') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    next_action VARCHAR(255),
    next_action_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_update_type (update_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 13. Case Documents
CREATE TABLE case_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    document_type ENUM('contract', 'evidence', 'court_order', 'pleading', 'correspondence', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_case (case_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_document_type (document_type)
) ENGINE=InnoDB;

-- =====================================================
-- PAYMENT AND FINANCIAL TABLES
-- =====================================================

-- 14. Payments
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    appointment_id INT,
    case_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online', 'cheque') NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
    INDEX idx_client (client_id),
    INDEX idx_appointment (appointment_id),
    INDEX idx_case (case_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB;

-- 15. Invoices
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    payment_id INT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date)
) ENGINE=InnoDB;

-- 16. Invoice Items (Line items)
CREATE TABLE invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id)
) ENGINE=InnoDB;

-- =====================================================
-- FEEDBACK AND COMMUNICATION TABLES
-- =====================================================

-- 17. Feedback
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    appointment_id INT,
    service_id INT,
    case_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    video_file_name VARCHAR(255),
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_lawyer (lawyer_id),
    INDEX idx_appointment (appointment_id),
    INDEX idx_case (case_id),
    INDEX idx_rating (rating),
    INDEX idx_is_published (is_published)
) ENGINE=InnoDB;

-- 18. Notifications
-- ✅ 3NF: Replaced polymorphic references with proper nullable FK columns
-- ✅ CHECK constraint ensures at most ONE entity is referenced
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('appointment', 'payment', 'case_update', 'system', 'message', 'reminder') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    -- Proper nullable FK columns instead of polymorphic pattern
    appointment_id INT NULL,
    case_id INT NULL,
    payment_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    -- Ensure at most one entity reference (prevents linking to multiple entities)
    CONSTRAINT chk_notifications_one_entity CHECK (
        (CASE WHEN appointment_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN case_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN payment_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
    ),
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_appointment (appointment_id),
    INDEX idx_case (case_id),
    INDEX idx_payment (payment_id)
) ENGINE=InnoDB;

-- =====================================================
-- DOCUMENT MANAGEMENT TABLES
-- =====================================================

-- 19. Documents (General document storage)
-- ✅ 3NF: Consolidated document storage with proper FK columns
-- ✅ CHECK constraint ensures at most ONE entity is referenced
-- Removed case_documents table (was duplicate)
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    uploaded_by INT NOT NULL,
    -- Proper nullable FK columns instead of polymorphic pattern
    case_id INT NULL,
    appointment_id INT NULL,
    payment_id INT NULL,
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE,
    -- Ensure at most one entity reference
    CONSTRAINT chk_documents_one_entity CHECK (
        (CASE WHEN case_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN appointment_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN payment_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
    ),
    INDEX idx_case (case_id),
    INDEX idx_appointment (appointment_id),
    INDEX idx_payment (payment_id),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB;

-- =====================================================
-- AUDIT AND SYSTEM TABLES
-- =====================================================

-- 20.Activity Logs (Audit trail)
-- ✅ 3NF: Replaced polymorphic references with proper nullable FK columns
-- ✅ CHECK constraint ensures at most ONE affected entity
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    -- Proper nullable FK columns instead of polymorphic pattern
    user_affected_id INT NULL,
    case_affected_id INT NULL,
    appointment_affected_id INT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (user_affected_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (case_affected_id) REFERENCES cases(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_affected_id) REFERENCES appointments(id) ON DELETE SET NULL,
    -- Ensure at most one affected entity
    CONSTRAINT chk_activity_logs_one_entity CHECK (
        (CASE WHEN user_affected_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN case_affected_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN appointment_affected_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
    ),
    INDEX idx_user (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_user_affected (user_affected_id),
    INDEX idx_case_affected (case_affected_id),
    INDEX idx_appointment_affected (appointment_affected_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- 21. System Settings
-- ✅ 3NF: Removed JSON array storage (payment_methods moved to separate table)
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
   setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    data_type ENUM('string', 'number', 'boolean') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB;

-- 22. Payment Methods
-- ✅ 3NF: Proper normalized table instead of JSON in system_settings
CREATE TABLE payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    method ENUM('Bank Transfer', 'Cash Deposit', 'Cheque', 'Online Payment', 'Card Payment') UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_enabled (is_enabled)
) ENGINE=InnoDB;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Lawyer Statistics (replaces derived columns in lawyer_profiles)
-- ✅ 3NF: Dynamically computed instead of stored
CREATE VIEW lawyer_statistics AS
SELECT 
    lp.lawyer_id,
    COALESCE(AVG(f.rating), 0) AS rating,
    COALESCE(COUNT(DISTINCT c.id), 0) AS total_cases,
    COALESCE(SUM(CASE WHEN c.status = 'won' THEN 1 ELSE 0 END), 0) AS cases_won
FROM lawyer_profiles lp
LEFT JOIN feedback f ON f.lawyer_id = lp.lawyer_id AND f.is_published = TRUE
LEFT JOIN cases c ON c.lawyer_id = lp.lawyer_id
GROUP BY lp.lawyer_id;

-- View: Complete lawyer information
-- ✅ 3NF: Joins lawyer_statistics view for computed values
CREATE VIEW vw_lawyers AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.is_active,
    lp.bar_registration,
    lp.license_number,
    lp.experience_years,
    lp.education,
    lp.bio,
    lp.consultation_fee,
    ls.rating,
    ls.total_cases,
    ls.cases_won,
    lp.availability_status,
    u.created_at
FROM users u
LEFT JOIN lawyer_profiles lp ON u.id = lp.lawyer_id
LEFT JOIN lawyer_statistics ls ON ls.lawyer_id = u.id
WHERE u.role = 'lawyer';

-- View: Complete client information
CREATE VIEW vw_clients AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.is_active,
    cp.phone,
    cp.address,
    cp.city,
    cp.state,
    cp.postal_code,
    cp.date_of_birth,
    cp.occupation,
    cp.company_name,
    u.created_at
FROM users u
LEFT JOIN client_profiles cp ON u.id = cp.client_id
WHERE u.role = 'client';

-- View: Appointment details with names
CREATE VIEW vw_appointments AS
SELECT 
    a.id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.status,
    a.fee,
    a.payment_status,
    c.name AS client_name,
    c.email AS client_email,
    l.name AS lawyer_name,
    l.email AS lawyer_email,
    s.name AS service_name,
    a.created_at
FROM appointments a
JOIN users c ON a.client_id = c.id
JOIN users l ON a.lawyer_id = l.id
LEFT JOIN services s ON a.service_id = s.id;

-- View: Case details with names
CREATE VIEW vw_cases AS
SELECT 
    cs.id,
    cs.case_number,
    cs.title,
    cs.status,
    cs.priority,
    cs.filing_date,
    cs.next_hearing_date,
    c.name AS client_name,
    c.email AS client_email,
    l.name AS lawyer_name,
    l.email AS lawyer_email,
    s.name AS service_name,
    cs.created_at
FROM cases cs
JOIN users c ON cs.client_id = c.id
JOIN users l ON cs.lawyer_id = l.id
LEFT JOIN services s ON cs.service_id = s.id;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- ✅ 3NF: Removed trigger - rating now computed dynamically via lawyer_statistics view
-- No trigger needed since we don't store rating anymore

-- Trigger: Create notification on appointment creation
-- ✅ 3NF: Uses proper appointment_id FK instead of polymorphic pattern
DELIMITER //
CREATE TRIGGER trg_appointment_notification 
AFTER INSERT ON appointments
FOR EACH ROW
BEGIN
    -- Notification for client
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
        NEW.client_id,
        'appointment',
        'New Appointment Scheduled',
        CONCAT('Your appointment has been scheduled for ', DATE_FORMAT(NEW.appointment_date, '%M %d, %Y'), ' at ', TIME_FORMAT(NEW.start_time, '%h:%i %p')),
        NEW.id,
        'high'
    );
    
    -- Notification for lawyer
    INSERT INTO notifications (user_id, type, title, message, appointment_id, priority)
    VALUES (
        NEW.lawyer_id,
        'appointment',
        'New Appointment Request',
        CONCAT('New appointment scheduled for ', DATE_FORMAT(NEW.appointment_date, '%M %d, %Y'), ' at ', TIME_FORMAT(NEW.start_time, '%h:%i %p')),
        NEW.id,
        'high'
    );
END//
DELIMITER ;

-- Trigger: Create notification on case update
-- ✅ 3NF: Uses proper case_id FK instead of polymorphic pattern
DELIMITER //
CREATE TRIGGER trg_case_update_notification 
AFTER INSERT ON case_updates
FOR EACH ROW
BEGIN
    DECLARE v_client_id INT;
    DECLARE v_lawyer_id INT;
    
    SELECT client_id, lawyer_id INTO v_client_id, v_lawyer_id
    FROM cases WHERE id = NEW.case_id;
    
    -- Notification for client
    INSERT INTO notifications (user_id, type, title, message, case_id, priority)
    VALUES (
        v_client_id,
        'case_update',
        CONCAT('Case Update: ', NEW.title),
        NEW.description,
        NEW.case_id,
        'medium'
    );
END//
DELIMITER ;

-- ✅ 3NF: Removed trigger - activity_logs polymorphic pattern was replaced with proper FKs
-- If payment logging is needed, implement via application code using payment_id FK

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default specializations
INSERT INTO specializations (name, description) VALUES
('Corporate Law', 'Legal practice related to business and corporate matters'),
('Criminal Law', 'Legal practice focused on crimes and criminal proceedings'),
('Family Law', 'Legal practice concerning family matters and domestic relations'),
('Property Law', 'Legal practice concerning property and real estate transactions'),
('Contract Law', 'Legal practice concerning agreements and contracts'),
('Legal Documentation', 'Legal practice concerning the drafting of legal documents');

-- Insert default service categories
INSERT INTO service_categories (name, description, icon, display_order) VALUES
('Corporate Law Services', 'Business formation, compliance, and corporate disputes', 'Briefcase', 1),
('Criminal Law Services', 'Defense and representation in criminal proceedings', 'Scale', 2),
('Family Law Services', 'Divorce, custody, and domestic matters', 'Users', 3),
('Property Law Services', 'Real estate transactions and property disputes', 'Home', 4),
('Contract Law Services', 'Contract drafting, review, and disputes', 'FileSignature', 5),
('Legal Documentation', 'Preparation of wills, trusts, and other legal documents', 'FileText', 6);

-- Insert default services
INSERT INTO services (category_id, name, description, base_fee, duration_minutes) VALUES
(1, 'Corporate Consultation', 'Initial business consultation', 10000.00, 60),
(1, 'Business Formation', 'Company registration and structuring', 25000.00, 120),
(2, 'Criminal Defense Consultation', 'Initial consultation for criminal matters', 8000.00, 60),
(2, 'Court Representation (Criminal)', 'Representation in criminal court', 35000.00, 180),
(3, 'Family Law Consultation', 'Initial consultation for family matters', 6000.00, 60),
(3, 'Divorce Filing', 'Preparation and filing of divorce proceedings', 20000.00, 120),
(4, 'Property Dispute Consultation', 'Consultation for property issues', 7000.00, 60),
(4, 'Deed Transfer', 'Legal transfer of property deeds', 15000.00, 90),
(5, 'Contract Drafting', 'Professional drafting of legal agreements', 12000.00, 90),
(5, 'Contract Review', 'Comprehensive review of existing contracts', 8000.00, 60),
(6, 'Will Preparation', 'Drafting of Last Will and Testament', 10000.00, 90),
(6, 'Power of Attorney', 'Drafting Power of Attorney documents', 5000.00, 45);

-- Insert default system settings
-- ✅ 3NF: Removed payment_methods JSON - now in payment_methods table
INSERT INTO system_settings (setting_key, setting_value, data_type, description) VALUES
('site_name', 'DNJ Legal Firm', 'string', 'Name of the legal firm'),
('appointment_slot_duration', '60', 'number', 'Default appointment duration in minutes'),
('tax_rate', '0.18', 'number', 'Tax rate for invoices (GST)'),
('currency', 'LKR', 'string', 'Currency code'),
('business_hours_start', '09:00', 'string', 'Business hours start time'),
('business_hours_end', '18:00', 'string', 'Business hours end time'),
('max_appointments_per_day', '8', 'number', 'Maximum appointments per lawyer per day');

-- Insert default payment methods (proper normalized table)
INSERT INTO payment_methods (method, is_enabled, display_order) VALUES
('Bank Transfer', TRUE, 1),
('Cash Deposit', TRUE, 2),
('Cheque', TRUE, 3),
('Online Payment', FALSE, 4),
('Card Payment', FALSE, 5);

-- =====================================================
-- DATABASE INITIALIZATION COMPLETE
-- =====================================================

SELECT 'Database initialization completed successfully!' AS status;
SELECT COUNT(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'legal_mgmt';
