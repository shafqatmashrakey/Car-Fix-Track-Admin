<?php
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Shop Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        .header {
            background-color: #f0f0f0;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .title {
            font-size: 24px;
            font-weight: bold;
        }

        .dropdown {
            position: relative;
            display: inline-block;
        }

        .dropbtn {
            background-color: #f0f0f0;
            padding: 10px;
            border: none;
            cursor: pointer;
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: #fff;
            min-width: 160px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            z-index: 1;
        }

        .dropdown-content a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
        }

        .dropdown:hover .dropdown-content {
            display: block;
        }

        .dropdown-content a:hover {
            background-color: #f1f1f1;
        }

        .content {
            padding: 20px;
        }

        .page-title {
            font-size: 20px;
            margin-bottom: 20px;
        }

        .add-button {
            background-color: #f0f0f0;
            border: none;
            padding: 10px 20px;
            margin-bottom: 20px;
            cursor: pointer;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        th {
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <?php
    $current_page = isset($_GET['page']) ? $_GET['page'] : 'customers';
    ?>

    <div class="header">
        <div class="title">Car Shop Management System</div>
        <div class="dropdown">
            <button class="dropbtn">Menu ▼</button>
            <div class="dropdown-content">
                <a href="?page=customers">Customers</a>
                <a href="?page=vehicles">Vehicles</a>
                <a href="?page=employees">Employees</a>
                <a href="?page=appointments">Appointments</a>
                <a href="?page=services">Services</a>
            </div>
        </div>
    </div>

    <div class="content">
        <?php
        switch($current_page) {
            case 'customers':
                include 'pages/customers-page.php';
                break;
            case 'vehicles':
                include 'pages/vehicles-page.php';
                break;
            case 'employees':
                include 'pages/employees-page.php';
                break;
            case 'appointments':
                include 'pages/appointments-page.php';
                break;
            case 'services':
                include 'pages/services-page.php';
                break;
            default:
                include 'pages/customers-page.php';
        }
        ?>
    </div>
</body>
</html>
