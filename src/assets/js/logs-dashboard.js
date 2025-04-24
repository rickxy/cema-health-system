/**
 * Page Audit Logs
 */

'use strict';

// Datatable (jquery)
$(function () {
  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  const dt_audit_table = $('.datatables-users'),
    statusObj = {
      'login': { title: 'Login', class: 'bg-label-success' },
      'logout': { title: 'Logout', class: 'bg-label-secondary' },
      'create': { title: 'Create', class: 'bg-label-primary' },
      'update': { title: 'Update', class: 'bg-label-warning' },
      'delete': { title: 'Delete', class: 'bg-label-danger' }
    };

  // Audit Logs datatable
  if (dt_audit_table.length) {
    const dt_audit = dt_audit_table.DataTable({
      ajax: {
        url: '/api/v1/logs/',
        type: 'GET',
        dataSrc: 'data'
      },
      columns: [
        { data: '' }, // Responsive control
        { data: 'user' },
        { data: 'action' },
        { data: 'section' },
        { data: 'timestamp' },
        { data: 'description', visible: false } // Hidden column for details
      ],
      columnDefs: [
        {
          // Responsive control column
          className: 'control',
          orderable: false,
          targets: 0,
          render: () => ''
        },
        {
          // User column with avatar
          targets: 1,
          render: function (data, type, full, meta) {
            const avatar = full.user_avatar ?
              `<img src="${full.user_avatar}" alt="Avatar" class="rounded-circle me-2" width="32">` :
              `<span class="avatar-initial rounded-circle bg-label-primary me-2">${data ? data.charAt(0) : 'S'}</span>`;

            return `<div class="d-flex align-items-center">
              <div class="d-flex flex-column">
                <span class="fw-medium">${data || 'System'}</span>
              </div>
            </div>`;
          }
        },
        {
          // Action badge
          targets: 2,
          render: function (data, type, full, meta) {
            const action = data.toLowerCase();
            const status = statusObj[action] || {
              title: action,
              class: 'bg-label-info'
            };
            return `${status.title}`;
          }
        },
        {
          // Section
          targets: 3,
          render: (data) => `<span class="text-truncate">${data || 'N/A'}</span>`
        },
        {
          // Date
          targets: 4,
          render: function (data) {
            const date = new Date(data);
            return `<span class="text-truncate">
              ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
            </span>`;
          }
        },
        {
          // Description (hidden)
          targets: 5,
          visible: false,
          render: (data) => data || 'No description'
        }
      ],
      order: [[4, 'desc']], // Order by timestamp
      dom:
        '<"row me-2"' +
        '<"col-md-2"<"me-3"l>>' +
        '<"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-3 mb-md-0"fB>>' +
        '>t' +
        '<"row mx-2"' +
        '<"col-sm-12 col-md-6"i>' +
        '<"col-sm-12 col-md-6"p>' +
        '>',
      language: {
        sLengthMenu: '_MENU_',
        search: '',
        searchPlaceholder: 'Search..'
      },
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle mx-3',
          text: '<i class="ti ti-screen-share me-1 ti-xs"></i>Export',
          buttons: [
            {
              extend: 'print',
              text: '<i class="ti ti-printer me-2"></i>Print',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4] // User, Action, Section, Date
              }
            },
            // ... other export buttons with same columns
          ]
        }
      ],
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              const data = row.data();
              return `Details of ${data.action} action`;
            }
          }),
          type: 'column',
          renderer: function (api, rowIdx, columns) {
            const data = $.map(columns, function (col) {
              // Include description in details
              if (col.title === 'Description') {
                return `<tr>
                  <td>${col.title}:</td>
                  <td>${col.data}</td>
                </tr>`;
              }
              return col.title !== '' && col.title !== 'Description'
                ? `<tr>
                    <td>${col.title}:</td>
                    <td>${col.data}</td>
                  </tr>`
                : '';
            }).join('');

            return data ? $('<table class="table"/><tbody />').append(data) : false;
          }
        }
      },
      initComplete: function () {
        // Add section filter
        this.api()
          .columns(3)
          .every(function () {
            const column = this;
            const select = $(
              '<select class="form-select"><option value="">All Sections</option></select>'
            )
              .appendTo('.user_role')
              .on('change', function () {
                const val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d) {
                if (d) select.append(`<option value="${d}">${d}</option>`);
              });
          });

        // Keep existing action filter
        this.api()
          .columns(2)
          .every(function () {
            // ... existing action filter code
          });
      }
    });
  }

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
