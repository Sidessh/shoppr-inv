const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = 3002;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/bharat_shops_hub',
});

app.use(express.json());
app.use(express.static('public'));

// Serve HTML interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Bharat Shops Hub - Database Viewer</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .table-list { margin: 20px 0; }
            .table-item { 
                background: #f8f9fa; 
                padding: 15px; 
                margin: 10px 0; 
                border-radius: 5px; 
                border-left: 4px solid #007bff;
                cursor: pointer;
                transition: background 0.3s;
            }
            .table-item:hover { background: #e9ecef; }
            .table-name { font-weight: bold; color: #007bff; }
            .table-count { color: #6c757d; font-size: 0.9em; }
            .data-table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 20px; 
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .data-table th, .data-table td { 
                padding: 12px; 
                text-align: left; 
                border-bottom: 1px solid #ddd; 
            }
            .data-table th { 
                background: #007bff; 
                color: white; 
                font-weight: bold; 
            }
            .data-table tr:nth-child(even) { background: #f8f9fa; }
            .data-table tr:hover { background: #e9ecef; }
            .back-btn { 
                background: #6c757d; 
                color: white; 
                padding: 10px 20px; 
                border: none; 
                border-radius: 5px; 
                cursor: pointer; 
                margin-bottom: 20px;
            }
            .back-btn:hover { background: #5a6268; }
            .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .success { color: #155724; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🗄️ Bharat Shops Hub Database Viewer</h1>
            <div id="content">
                <div class="table-list" id="tableList">
                    <h3>📋 Available Tables:</h3>
                    <div id="tables"></div>
                </div>
                <div id="tableData" style="display: none;">
                    <button class="back-btn" onclick="showTables()">← Back to Tables</button>
                    <h3 id="currentTable"></h3>
                    <div id="dataContent"></div>
                </div>
            </div>
        </div>

        <script>
            // Load tables on page load
            window.onload = function() {
                loadTables();
            };

            async function loadTables() {
                try {
                    const response = await fetch('/api/tables');
                    const tables = await response.json();
                    displayTables(tables);
                } catch (error) {
                    document.getElementById('tables').innerHTML = '<div class="error">Error loading tables: ' + error.message + '</div>';
                }
            }

            function displayTables(tables) {
                const container = document.getElementById('tables');
                container.innerHTML = '';
                
                tables.forEach(table => {
                    const div = document.createElement('div');
                    div.className = 'table-item';
                    div.onclick = () => loadTableData(table.name);
                    div.innerHTML = \`
                        <div class="table-name">📊 \${table.name}</div>
                        <div class="table-count">\${table.count} records</div>
                    \`;
                    container.appendChild(div);
                });
            }

            async function loadTableData(tableName) {
                try {
                    const response = await fetch(\`/api/table/\${tableName}\`);
                    const data = await response.json();
                    displayTableData(tableName, data);
                } catch (error) {
                    document.getElementById('dataContent').innerHTML = '<div class="error">Error loading data: ' + error.message + '</div>';
                }
            }

            function displayTableData(tableName, data) {
                document.getElementById('tableList').style.display = 'none';
                document.getElementById('tableData').style.display = 'block';
                document.getElementById('currentTable').textContent = \`📊 Table: \${tableName} (\${data.length} records)\`;
                
                if (data.length === 0) {
                    document.getElementById('dataContent').innerHTML = '<div class="success">No data found in this table.</div>';
                    return;
                }

                const columns = Object.keys(data[0]);
                let tableHTML = '<table class="data-table"><thead><tr>';
                
                columns.forEach(col => {
                    tableHTML += \`<th>\${col}</th>\`;
                });
                tableHTML += '</tr></thead><tbody>';
                
                data.forEach(row => {
                    tableHTML += '<tr>';
                    columns.forEach(col => {
                        let value = row[col];
                        if (value === null) value = '<em>null</em>';
                        else if (typeof value === 'object') value = JSON.stringify(value);
                        else if (typeof value === 'boolean') value = value ? '✅ true' : '❌ false';
                        tableHTML += \`<td>\${value}</td>\`;
                    });
                    tableHTML += '</tr>';
                });
                
                tableHTML += '</tbody></table>';
                document.getElementById('dataContent').innerHTML = tableHTML;
            }

            function showTables() {
                document.getElementById('tableList').style.display = 'block';
                document.getElementById('tableData').style.display = 'none';
            }
        </script>
    </body>
    </html>
  `);
});

// API endpoint to get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        table_name as name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tables = [];
    for (const row of result.rows) {
      const countResult = await pool.query(`SELECT COUNT(*) as count FROM "${row.name}"`);
      tables.push({
        name: row.name,
        count: parseInt(countResult.rows[0].count)
      });
    }
    
    res.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get table data
app.get('/api/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT 100`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🗄️ Database viewer running at http://localhost:${port}`);
  console.log(`📊 View your PostgreSQL database tables and data`);
});
