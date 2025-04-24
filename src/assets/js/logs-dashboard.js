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
    select2 = $('.select2'),
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
        { data: '' },
        { data: 'user' },
        { data: 'action' },
        { data: 'timestamp' }
      ],
      columnDefs: [
        {
          // For Responsive
          className: 'control',
          orderable: false,
          targets: 0,
          render: function (data, type, full, meta) {
            return '';
          }
        },
        {
          // User column
          targets: 1,
          render: function (data, type, full, meta) {
            return `<div class="d-flex align-items-center">
              <div class="d-flex flex-column">
                <span class="fw-medium">${data || 'System'}</span>
              </div>
            </div>`;
          }
        },
        {
          // Action column
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
          // Date column
          targets: 3,
          render: function (data, type, full, meta) {
            const date = new Date(data);
            return `<span class="text-truncate">
              ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
            </span>`;
          }
        }
      ],
      order: [[3, 'desc']],
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
                columns: [1, 2, 3]
              }
            },
            {
              extend: 'csv',
              text: '<i class="ti ti-file-text me-2"></i>CSV',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3]
              }
            },
            {
              extend: 'excel',
              text: '<i class="ti ti-file-spreadsheet me-2"></i>Excel',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3]
              }
            },
            {
              extend: 'pdf',
              text: '<i class="ti ti-file-code-2 me-2"></i>PDF',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3]
              }
            },
            {
              extend: 'copy',
              text: '<i class="ti ti-copy me-2"></i>Copy',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3]
              }
            }
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
              return col.title !== ''
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
        // Add action type filter
        this.api()
          .columns(2)
          .every(function () {
            const column = this;
            const select = $(
              '<select class="form-select text-capitalize"><option value="">All Actions</option></select>'
            )
              .appendTo('.user_status')
              .on('change', function () {
                const val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? `^${val}$` : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d) {
                select.append(`<option value="${d}">${d}</option>`);
              });
          });

        // Add user filter
        this.api()
          .columns(1)
          .every(function () {
            const column = this;
            const select = $(
              '<select class="form-select"><option value="">All Users</option></select>'
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
      }
    });
  }

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
