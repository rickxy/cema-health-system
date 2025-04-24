/**
 * app-components-list
 */

'use strict';

// Initialize Toastr
$(document).ready(function () {
  console.log('Document ready event fired');
  // Configure Toastr options
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: true,
    progressBar: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  };
  console.log('Toastr options configured');
});

// Datatable (jquery)
$(function () {
  console.log('jQuery ready function started');

  let borderColor, bodyBg, headingColor;

  if (isDarkStyle) {
    console.log('Using dark style colors');
    borderColor = config.colors_dark.borderColor;
    bodyBg = config.colors_dark.bodyBg;
    headingColor = config.colors_dark.headingColor;
  } else {
    console.log('Using light style colors');
    borderColor = config.colors.borderColor;
    bodyBg = config.colors.bodyBg;
    headingColor = config.colors.headingColor;
  }

  // Variable declaration for table
  var dt_component_table = $('.datatables-products'),
    componentAdd = '/components/create/',
    statusObj = {
      active: { title: 'Active', class: 'bg-label-success' },
      inactive: { title: 'Inactive', class: 'bg-label-danger' },
      pending: { title: 'Pending', class: 'bg-label-warning' }
    };

  console.log('Table selector found:', dt_component_table.length > 0);
  console.log('Table element:', dt_component_table);
  console.log('Table HTML before processing:', dt_component_table.html());
  console.log('Table element properties:', {
    isTable: dt_component_table.is('table'),
    hasThead: dt_component_table.find('thead').length > 0,
    hasTbody: dt_component_table.find('tbody').length > 0,
    hasTh: dt_component_table.find('th').length > 0,
    hasTr: dt_component_table.find('tr').length > 0,
    classes: dt_component_table.attr('class')
  });

  // Components datatable
  if (dt_component_table.length) {
    console.log('DataTable element found, initializing...');

    // Create a complete table structure if it doesn't exist
    if (!dt_component_table.find('thead').length || !dt_component_table.find('tbody').length) {
      console.log('Creating complete table structure');

      // Clear the table first
      dt_component_table.empty();

      // Create thead with proper column headers
      var thead = $('<thead><tr></tr></thead>');
      thead.find('tr').append(
        '<th class="control"></th>' + // Control column
          '<th class="checkbox"></th>' + // Checkbox column
          '<th>Name</th>' +
          '<th>Description</th>' +
          '<th>Date Created</th>' +
          '<th>Status</th>' +
          '<th>Actions</th>'
      );

      // Create tbody
      var tbody = $('<tbody></tbody>');

      // Append thead and tbody to the table
      dt_component_table.append(thead).append(tbody);

      // Add required classes to the table
      dt_component_table.addClass('datatables-products table');

      console.log('Table structure created');
      console.log('Table HTML after creating structure:', dt_component_table.html());
      console.log('Table element properties after structure creation:', {
        isTable: dt_component_table.is('table'),
        hasThead: dt_component_table.find('thead').length > 0,
        hasTbody: dt_component_table.find('tbody').length > 0,
        hasTh: dt_component_table.find('th').length > 0,
        hasTr: dt_component_table.find('tr').length > 0,
        classes: dt_component_table.attr('class')
      });
    } else {
      console.log('Table already has thead and tbody elements');
    }

    try {
      // Ensure the table has the correct structure before initializing DataTable
      if (!dt_component_table.find('thead tr th').length) {
        console.error('Table structure is incomplete. Cannot initialize DataTable.');
        console.log('Table HTML at error point:', dt_component_table.html());
        return;
      }

      console.log('Table has proper structure with header cells:', dt_component_table.find('thead tr th').length);
      console.log('Table HTML before DataTable initialization:', dt_component_table.html());
      console.log('Table element properties before initialization:', {
        isTable: dt_component_table.is('table'),
        hasThead: dt_component_table.find('thead').length > 0,
        hasTbody: dt_component_table.find('tbody').length > 0,
        hasTh: dt_component_table.find('th').length > 0,
        hasTr: dt_component_table.find('tr').length > 0,
        classes: dt_component_table.attr('class'),
        theadThCount: dt_component_table.find('thead th').length,
        theadTrCount: dt_component_table.find('thead tr').length,
        tbodyTrCount: dt_component_table.find('tbody tr').length
      });

      // Check if DataTables is loaded
      if (typeof $.fn.DataTable === 'undefined') {
        console.error('DataTables is not loaded!');
        return;
      }

      console.log('DataTables is loaded, proceeding with initialization');
      console.log('DataTables version:', $.fn.dataTable.version);
      console.log('DataTables responsive extension loaded:', typeof $.fn.dataTable.Responsive !== 'undefined');
      console.log('DataTables buttons extension loaded:', typeof $.fn.dataTable.Buttons !== 'undefined');

      // Check if the table is visible
      console.log('Table visibility:', {
        isVisible: dt_component_table.is(':visible'),
        display: dt_component_table.css('display'),
        width: dt_component_table.width(),
        height: dt_component_table.height(),
        offset: dt_component_table.offset()
      });

      // Check if the table has a parent container
      console.log('Table parent container:', {
        hasParent: dt_component_table.parent().length > 0,
        parentElement: dt_component_table.parent().prop('tagName'),
        parentClasses: dt_component_table.parent().attr('class'),
        parentVisibility: dt_component_table.parent().is(':visible'),
        parentDisplay: dt_component_table.parent().css('display')
      });

      var dt_components = dt_component_table.DataTable({
        ajax: {
          url: '/components/data/',
          dataSrc: 'data',
          error: function (xhr, error, thrown) {
            console.error('AJAX error:', error, thrown);
            console.error('XHR response:', xhr.responseText);
          }
        },
        pageLength: 10, // Set default display length to 10
        columns: [
          // columns according to JSON
          { data: null, defaultContent: '' },
          { data: null, defaultContent: '' },
          { data: 'name' },
          { data: 'description' },
          { data: 'date_created' },
          { data: 'status' },
          { data: null, defaultContent: '' }
        ],
        columnDefs: [
          {
            // For Responsive
            className: 'control',
            searchable: false,
            orderable: false,
            responsivePriority: 2,
            targets: 0,
            render: function (data, type, full, meta) {
              console.log('Rendering control column:', { data, type, full, meta });
              return '';
            }
          },
          {
            // For Checkboxes
            targets: 1,
            orderable: false,
            checkboxes: {
              selectAllRender: '<input type="checkbox" class="form-check-input">'
            },
            render: function () {
              return '<input type="checkbox" class="dt-checkboxes form-check-input" >';
            },
            searchable: false
          },
          {
            // Name and image
            targets: 2,
            responsivePriority: 1,
            render: function (data, type, full, meta) {
              console.log('Rendering name column:', { data, type, full, meta });
              var $name = full['name'] || '',
                $id = full['id'] || '',
                $image = full['image'] || '';

              console.log('Name data:', { $name, $id, $image });

              if ($image) {
                // For image
                var $output = '<img src="' + $image + '" alt="Component-' + $id + '" class="rounded-2">';
              } else {
                // For badge
                var stateNum = Math.floor(Math.random() * 6);
                var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                var $state = states[stateNum],
                  $name = full['name'] || '',
                  $initials = $name.match(/\b\w/g) || [];
                $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
                $output = '<span class="avatar-initial rounded-2 bg-label-' + $state + '">' + $initials + '</span>';
              }
              // Creates full output for name
              var $row_output =
                '<div class="d-flex justify-content-start align-items-center component-name">' +
                '<div class="avatar-wrapper">' +
                '<div class="avatar avatar me-2 rounded-2 bg-label-secondary">' +
                $output +
                '</div>' +
                '</div>' +
                '<div class="d-flex flex-column">' +
                '<h6 class="text-body text-nowrap mb-0">' +
                $name +
                '</h6>' +
                '</div>' +
                '</div>';
              return $row_output;
            }
          },
          {
            // Description
            targets: 3,
            render: function (data, type, full, meta) {
              console.log('Rendering description column:', { data, type, full, meta });
              var $description = full['description'] || '';

              // Truncate description to 30 characters with ellipsis if longer
              if ($description.length > 30) {
                $description = $description.substring(0, 30) + '...';
              }

              return '<span class="text-truncate d-flex align-items-center">' + $description + '</span>';
            }
          },
          {
            // Date Created
            targets: 4,
            render: function (data, type, full, meta) {
              console.log('Rendering date column:', { data, type, full, meta });
              var $date = full['date_created'] || '';
              return '<span class="text-truncate d-flex align-items-center">' + $date + '</span>';
            }
          },
          {
            // Status
            targets: 5,
            render: function (data, type, full, meta) {
              console.log('Rendering status column:', { data, type, full, meta });
              var $status = full['status'] || 'inactive';
              console.log('Status data:', { $status, statusObj: statusObj[$status] });

              // Ensure statusObj[$status] exists
              if (!statusObj[$status]) {
                console.warn('Status not found in statusObj:', $status);
                // Create a default status object if not found
                statusObj[$status] = {
                  title: $status.charAt(0).toUpperCase() + $status.slice(1),
                  class: 'bg-label-secondary'
                };
              }

              return (
                '<span class="badge ' +
                statusObj[$status].class +
                '" text-capitalized>' +
                statusObj[$status].title +
                '</span>'
              );
            }
          },
          {
            // Actions
            targets: 6,
            title: 'Actions',
            searchable: false,
            orderable: false,
            render: function (data, type, full, meta) {
              console.log('Rendering actions column:', { data, type, full, meta });
              var $id = full['id'] || '';
              var $status = full['status'] || 'inactive';

              // Determine the opposite status
              var oppositeStatus = $status === 'active' ? 'inactive' : 'active';
              var oppositeStatusTitle = statusObj[oppositeStatus].title;

              return (
                '<div class="d-inline-block text-nowrap">' +
                '<button class="btn btn-sm btn-icon edit-record"><i class="ti ti-edit"></i></button>' +
                '<button class="btn btn-sm btn-icon delete-record"><i class="ti ti-trash"></i></button>' +
                '<div class="dropdown d-inline-block">' +
                '<button class="btn btn-sm btn-icon dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical me-2"></i></button>' +
                '<div class="dropdown-menu dropdown-menu-end m-0">' +
                '<a href="javascript:void(0);" class="dropdown-item view-record"><i class="ti ti-eye me-1"></i>View</a>' +
                '<div class="dropdown-divider"></div>' +
                '<div class="dropdown-header">Change Status</div>' +
                '<a href="javascript:void(0);" class="dropdown-item status-change" data-partner-id="' +
                $id +
                '" data-status="' +
                oppositeStatus +
                '">Set as ' +
                oppositeStatusTitle +
                '</a>' +
                '</div>' +
                '</div>' +
                '</div>'
              );
            }
          }
        ],
        order: [[2, 'asc']], // Order by name column (index 2) in ascending order
        dom:
          '<"card-header d-flex border-top rounded-0 flex-wrap py-2"' +
          '<"me-5 ms-n2 pe-5"f>' +
          '<"d-flex justify-content-start justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex flex-column align-items-start align-items-md-center justify-content-sm-center mb-3 mb-md-0 pt-0 gap-4 gap-sm-0 flex-sm-row"lB>>' +
          '>t' +
          '<"row mx-2"' +
          '<"col-sm-12 col-md-6"i>' +
          '<"col-sm-12 col-md-6"p>' +
          '>',
        lengthMenu: [7, 10, 20, 50, 70, 100], //for length of menu
        language: {
          sLengthMenu: '_MENU_',
          search: '',
          searchPlaceholder: 'Search Component',
          info: 'Displaying _START_ to _END_ of _TOTAL_ entries'
        },
        // Buttons with Dropdown
        buttons: [
          {
            extend: 'collection',
            className: 'btn btn-label-secondary dropdown-toggle me-3',
            text: '<i class="ti ti-download me-1 ti-xs"></i>Export',
            buttons: [
              {
                extend: 'print',
                text: '<i class="ti ti-printer me-2" ></i>Print',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('component-name')) {
                          result = result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    }
                  }
                },
                customize: function (win) {
                  // Customize print view for dark
                  $(win.document.body)
                    .css('color', headingColor)
                    .css('border-color', borderColor)
                    .css('background-color', bodyBg);
                  $(win.document.body)
                    .find('table')
                    .addClass('compact')
                    .css('color', 'inherit')
                    .css('border-color', 'inherit')
                    .css('background-color', 'inherit');
                }
              },
              {
                extend: 'csv',
                text: '<i class="ti ti-file me-2" ></i>Csv',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('component-name')) {
                          result = result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    }
                  }
                }
              },
              {
                extend: 'excel',
                text: '<i class="ti ti-file-export me-2"></i>Excel',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('component-name')) {
                          result = result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    }
                  }
                }
              },
              {
                extend: 'pdf',
                text: '<i class="ti ti-file-text me-2"></i>Pdf',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('component-name')) {
                          result = result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    }
                  }
                }
              },
              {
                extend: 'copy',
                text: '<i class="ti ti-copy me-2"></i>Copy',
                className: 'dropdown-item',
                exportOptions: {
                  columns: [1, 2, 3, 4, 5],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('component-name')) {
                          result = result + item.lastChild.firstChild.textContent;
                        } else if (item.innerText === undefined) {
                          result = result + item.textContent;
                        } else result = result + item.innerText;
                      });
                      return result;
                    }
                  }
                }
              }
            ]
          },
          {
            text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Component</span>',
            className: 'add-new btn btn-primary ms-2 ms-sm-0',
            action: function () {
              window.location.href = componentAdd;
            }
          }
        ],
        // For responsive popup
        responsive: {
          details: {
            display: $.fn.dataTable.Responsive.display.modal({
              header: function (row) {
                var data = row.data();
                return 'Details of ' + data['name'];
              }
            }),
            type: 'column',
            renderer: function (api, rowIdx, columns) {
              var data = $.map(columns, function (col, i) {
                return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                  ? '<tr data-dt-row="' +
                      col.rowIndex +
                      '" data-dt-column="' +
                      col.columnIndex +
                      '">' +
                      '<td>' +
                      col.title +
                      ':' +
                      '</td> ' +
                      '<td>' +
                      col.data +
                      '</td>' +
                      '</tr>'
                  : '';
              }).join('');

              return data ? $('<table class="table"/><tbody />').append(data) : false;
            }
          }
        },
        initComplete: function () {
          console.log('DataTable initialization complete');
          // Adding status filter once table initialized
          this.api()
            .columns(5)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="ComponentStatus" class="form-select text-capitalize"><option value="">Status</option></select>'
              )
                .appendTo('.component_status')
                .on('change', function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  // Add null check for statusObj[d]
                  if (statusObj[d] && statusObj[d].title) {
                    select.append('<option value="' + statusObj[d].title + '">' + statusObj[d].title + '</option>');
                  }
                });
            });
        }
      });

      console.log('DataTable initialized successfully');
      $('.dataTables_length').addClass('mt-2 mt-sm-0 mt-md-3 me-2');
      $('.dt-buttons').addClass('d-flex flex-wrap');
    } catch (error) {
      console.error('Error initializing DataTable:', error);
      console.error('Error stack:', error.stack);
      console.log('Table HTML at error point:', dt_component_table.html());
      console.log('Table element properties at error point:', {
        isTable: dt_component_table.is('table'),
        hasThead: dt_component_table.find('thead').length > 0,
        hasTbody: dt_component_table.find('tbody').length > 0,
        hasTh: dt_component_table.find('th').length > 0,
        hasTr: dt_component_table.find('tr').length > 0,
        classes: dt_component_table.attr('class')
      });
    }
  } else {
    console.warn('DataTable element not found');
  }

  // Delete Record
  $('.datatables-products tbody').on('click', '.delete-record', function () {
    const row = $(this).parents('tr');
    const rowData = dt_components.row(row).data();
    const componentId = rowData.id;
    const componentName = rowData.name;

    Swal.fire({
      title: 'Delete Component',
      text: `Are you sure you want to delete "${componentName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      buttonsStyling: true,
      showCloseButton: false,
      showDenyButton: false
    }).then(result => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/components/${componentId}/delete/`,
          type: 'POST',
          data: {
            csrfmiddlewaretoken: $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            if (response.success) {
              Swal.fire({
                title: 'Deleted!',
                text: 'The component has been deleted.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: false
              }).then(() => {
                // Remove the row from the DataTable after the alert is closed
                dt_components.row(row).remove().draw();
              });
            } else {
              Swal.fire('Error!', response.message || 'Failed to delete component.', 'error');
            }
          },
          error: function () {
            Swal.fire('Error!', 'An error occurred while deleting the component.', 'error');
          }
        });
      }
    });
  });

  // Status Change Handler
  $('.datatables-products tbody').on('click', '.status-change', function () {
    console.log('Status change clicked');
    var componentId = $(this).data('partner-id');
    var newStatus = $(this).data('status');
    var $row = $(this).closest('tr');
    var $statusBadge = $row.find('td:eq(5) .badge');

    console.log('Status change details:', { componentId, newStatus });

    // Show loading state
    $statusBadge.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    // Send AJAX request to update status
    $.ajax({
      url: '/components/' + componentId + '/status/',
      type: 'POST',
      data: {
        status: newStatus,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
      },
      success: function (response) {
        console.log('Status update successful:', response);
        // Update the status badge
        $statusBadge.removeClass().addClass('badge ' + statusObj[newStatus].class);
        $statusBadge.html(statusObj[newStatus].title);

        // Show success message
        toastr.success('Status updated successfully');

        // Update the row data
        var rowData = dt_components.row($row).data();
        rowData.status = newStatus;
        dt_components.row($row).data(rowData);
      },
      error: function (xhr, status, error) {
        console.error('Status update failed:', { xhr, status, error });
        // Show error message
        toastr.error('Error updating status: ' + (xhr.responseJSON?.message || error));

        // Reset the badge
        $statusBadge.removeClass().addClass('badge ' + statusObj[$row.data().status].class);
        $statusBadge.html(statusObj[$row.data().status].title);
      }
    });
  });

  // Edit Record
  $('.datatables-products tbody').on('click', '.btn-icon.edit-record', function () {
    const row = $(this).parents('tr');
    const rowData = dt_components.row(row).data();
    const componentId = rowData.id;

    // Fetch component details
    $.ajax({
      url: `/components/get/${componentId}/`,
      type: 'GET',
      success: function (response) {
        if (response.success) {
          // Populate the edit form
          $('#editComponentId').val(response.data.id);
          $('#editName').val(response.data.name);
          $('#editDescription').val(response.data.description);
          $('#editStatus').val(response.data.status);

          // Handle image preview
          const imagePreview = $('#editImagePreview');
          if (response.data.image) {
            imagePreview.attr('src', response.data.image);
            imagePreview.show();
          } else {
            imagePreview.hide();
          }

          // Show the edit modal
          $('#editComponentModal').modal('show');
        } else {
          Swal.fire('Error!', response.message || 'Failed to fetch component details.', 'error');
        }
      },
      error: function () {
        Swal.fire('Error!', 'An error occurred while fetching component details.', 'error');
      }
    });
  });

  // Handle edit form submission
  $('#editComponentForm').on('submit', function (e) {
    e.preventDefault();
    const componentId = $('#editComponentId').val();
    const formData = new FormData(this);

    $.ajax({
      url: `/components/edit/${componentId}/`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function (response) {
        if (response.success) {
          $('#editComponentModal').modal('hide');
          Swal.fire({
            title: 'Updated!',
            text: 'The component has been updated.',
            icon: 'success',
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: false
          }).then(() => {
            // Refresh the DataTable
            dt_components.ajax.reload();
          });
        } else {
          Swal.fire('Error!', response.message || 'Failed to update component.', 'error');
        }
      },
      error: function () {
        Swal.fire('Error!', 'An error occurred while updating the component.', 'error');
      }
    });
  });

  // Handle image preview when a new image is selected
  $('#editImage').on('change', function () {
    const file = this.files[0];
    const imagePreview = $('#editImagePreview');

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imagePreview.attr('src', e.target.result);
        imagePreview.show();
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.hide();
    }
  });

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    console.log('Applying form control styles');
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);

  // View Record
  $('.datatables-products tbody').on('click', '.view-record', function (e) {
    e.preventDefault();
    const row = $(this).closest('tr');
    const rowData = dt_components.row(row).data();
    const componentId = rowData.id;

    // Fetch component details
    $.ajax({
      url: `/components/get/${componentId}/`,
      type: 'GET',
      success: function (response) {
        if (response.success) {
          // Populate the view modal
          $('#viewName').text(response.data.name);
          $('#viewDescription').text(response.data.description || 'No description available');
          $('#viewStatus').text(response.data.status);
          $('#viewDateCreated').text(response.data.date_created);

          // Handle image preview
          const imagePreview = $('#viewImage');
          if (response.data.image) {
            imagePreview.attr('src', response.data.image);
            imagePreview.show();
          } else {
            imagePreview.hide();
          }

          // Show the view modal
          $('#viewComponentModal').modal('show');
        } else {
          Swal.fire('Error!', response.message || 'Failed to fetch component details.', 'error');
        }
      },
      error: function () {
        Swal.fire('Error!', 'An error occurred while fetching component details.', 'error');
      }
    });
  });

  console.log('jQuery ready function completed');
});
