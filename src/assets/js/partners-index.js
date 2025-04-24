/**
 * app-partners-list
 */

'use strict';

// Initialize Toastr
$(document).ready(function () {
  console.log('Document ready, initializing Toastr...');
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
  console.log('Toastr initialized successfully');
});

// Datatable (jquery)
$(function () {
  console.log('Initializing DataTable...');
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
  var dt_partner_table = $('.datatables-products'),
    partnerAdd = '/partners/create/',
    statusObj = {
      active: { title: 'Active', class: 'bg-label-success' },
      inactive: { title: 'Inactive', class: 'bg-label-danger' },
      pending: { title: 'Pending', class: 'bg-label-warning' }
    };

  console.log('Table element:', dt_partner_table.length ? 'Found' : 'Not found');

  // Partners datatable
  if (dt_partner_table.length) {
    console.log('DataTable element found, initializing...');

    // Create a complete table structure if it doesn't exist
    if (!dt_partner_table.find('thead').length || !dt_partner_table.find('tbody').length) {
      console.log('Creating complete table structure');

      // Clear the table first
      dt_partner_table.empty();

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
      dt_partner_table.append(thead).append(tbody);

      // Add required classes to the table
      dt_partner_table.addClass('datatables-products table');
    }

    try {
      var dt_partners = dt_partner_table.DataTable({
        ajax: {
          url: '/partners/data/',
          dataSrc: 'data',
          error: function (xhr, error, thrown) {
            console.error('AJAX error:', error, thrown);
          }
        },
        pageLength: 10, // Set default page length to 10
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
              var $name = full['name'] || '',
                $id = full['id'] || '',
                $image = full['image'] || '';

              if ($image) {
                // For image
                var $output = '<img src="' + $image + '" alt="Partner-' + $id + '" class="rounded-2">';
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
                '<div class="d-flex justify-content-start align-items-center partner-name">' +
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
              var $date = full['date_created'] || '';
              return '<span class="text-truncate d-flex align-items-center">' + $date + '</span>';
            }
          },
          {
            // Status
            targets: 5,
            render: function (data, type, full, meta) {
              var $status = full['status'] || 'inactive';

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
          searchPlaceholder: 'Search Partner',
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
                        if (item.classList !== undefined && item.classList.contains('partner-name')) {
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
                        if (item.classList !== undefined && item.classList.contains('partner-name')) {
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
                        if (item.classList !== undefined && item.classList.contains('partner-name')) {
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
                        if (item.classList !== undefined && item.classList.contains('partner-name')) {
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
                        if (item.classList !== undefined && item.classList.contains('partner-name')) {
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
            text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Partner</span>',
            className: 'add-new btn btn-primary ms-2 ms-sm-0',
            action: function () {
              window.location.href = partnerAdd;
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
                '<select id="PartnerStatus" class="form-select text-capitalize"><option value="">Status</option></select>'
              )
                .appendTo('.partner_status')
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
    }
  } else {
    console.warn('DataTable element not found');
  }

  // Delete Record
  $('.datatables-products tbody').on('click', '.delete-record', function () {
    console.log('Delete button clicked');
    const row = $(this).parents('tr');
    const rowData = dt_partners.row(row).data();
    const partnerId = rowData.id;
    const partnerName = rowData.name;

    console.log('Deleting partner:', { partnerId, partnerName });

    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${partnerName}". This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        console.log('User confirmed deletion');
        // Send delete request
        $.ajax({
          url: `/partners/${partnerId}/delete/`,
          type: 'POST',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            console.log('Delete response:', response);
            if (response.success) {
              // Remove the row from the table
              dt_partners.row(row).remove().draw();

              // Show success message
              Swal.fire({
                title: 'Deleted!',
                text: 'The partner has been deleted.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: false
              });
            } else {
              console.error('Delete failed:', response.message);
              Swal.fire('Error!', response.message || 'Failed to delete partner.', 'error');
            }
          },
          error: function (xhr, status, error) {
            console.error('Delete error:', { xhr, status, error });
            Swal.fire('Error!', 'An error occurred while deleting the partner.', 'error');
          }
        });
      }
    });
  });

  // Status Change Handler
  $('.datatables-products tbody').on('click', '.status-change', function () {
    var partnerId = $(this).data('partner-id');
    var newStatus = $(this).data('status');
    var $row = $(this).closest('tr');
    var $statusBadge = $row.find('td:eq(5) .badge');

    // Show loading state
    $statusBadge.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');

    // Send AJAX request to update status
    $.ajax({
      url: '/partners/' + partnerId + '/status/',
      type: 'POST',
      data: {
        status: newStatus,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
      },
      success: function (response) {
        // Update the status badge
        $statusBadge.removeClass().addClass('badge ' + statusObj[newStatus].class);
        $statusBadge.html(statusObj[newStatus].title);

        // Show success message
        toastr.success('Status updated successfully');

        // Update the row data
        var rowData = dt_partners.row($row).data();
        rowData.status = newStatus;
        dt_partners.row($row).data(rowData);
      },
      error: function (xhr, status, error) {
        // Show error message
        toastr.error('Error updating status: ' + (xhr.responseJSON?.message || error));

        // Reset the badge
        $statusBadge.removeClass().addClass('badge ' + statusObj[$row.data().status].class);
        $statusBadge.html(statusObj[$row.data().status].title);
      }
    });
  });

  // Edit Record
  $('.datatables-products tbody').on('click', '.edit-record', function () {
    console.log('Edit button clicked');
    const row = $(this).parents('tr');
    const rowData = dt_partners.row(row).data();
    const partnerId = rowData.id;

    console.log('Editing partner:', { partnerId });

    // Fetch partner details
    $.ajax({
      url: `/partners/${partnerId}/get/`,
      type: 'GET',
      success: function (response) {
        console.log('Partner details:', response);
        if (response.success) {
          // Populate form fields
          $('#editPartnerId').val(response.data.id);
          $('#editName').val(response.data.name);
          $('#editDescription').val(response.data.description);
          $('#editStatus').val(response.data.status);

          // Handle image preview
          const imagePreview = $('#editImagePreview');
          if (response.data.image) {
            console.log('Setting image preview:', response.data.image);
            imagePreview.attr('src', response.data.image).show();
          } else {
            console.log('No image found, hiding preview');
            imagePreview.hide();
          }

          // Show modal
          const editPartnerModal = new bootstrap.Modal(document.getElementById('editPartnerModal'));
          editPartnerModal.show();
        } else {
          console.error('Failed to fetch partner details:', response.message);
          Swal.fire('Error!', response.message || 'Failed to fetch partner details.', 'error');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching partner details:', { xhr, status, error });
        Swal.fire('Error!', 'An error occurred while fetching partner details.', 'error');
      }
    });
  });

  // Handle image preview for new image selection
  $('#editImage').on('change', function () {
    const file = this.files[0];
    const imagePreview = $('#editImagePreview');

    if (file) {
      console.log('New image selected:', file.name);
      const reader = new FileReader();
      reader.onload = function (e) {
        console.log('Setting new image preview');
        imagePreview.attr('src', e.target.result).show();
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected, hiding preview');
      imagePreview.hide();
    }
  });

  // Handle edit form submission
  $('#editPartnerForm').on('submit', function (e) {
    e.preventDefault();
    console.log('Edit form submitted');

    const partnerId = $('#editPartnerId').val();
    const formData = new FormData(this);

    console.log('Submitting partner update:', { partnerId, formData });

    // Send update request
    $.ajax({
      url: `/partners/${partnerId}/edit/`,
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function (response) {
        console.log('Update response:', response);
        if (response.success) {
          // Close modal
          const editPartnerModal = bootstrap.Modal.getInstance(document.getElementById('editPartnerModal'));
          editPartnerModal.hide();

          // Refresh the table
          dt_partners.ajax.reload();

          // Show success message
          Swal.fire({
            title: 'Success!',
            text: 'Partner updated successfully.',
            icon: 'success',
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: false
          });
        } else {
          console.error('Update failed:', response.message);
          Swal.fire('Error!', response.message || 'Failed to update partner.', 'error');
        }
      },
      error: function (xhr, status, error) {
        console.error('Update error:', { xhr, status, error });
        Swal.fire('Error!', 'An error occurred while updating the partner.', 'error');
      }
    });
  });

  // Filter form control to default size
  // ? setTimeout used for multilingual table initialization
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);

  // View Record
  $('.datatables-products tbody').on('click', '.view-record', function () {
    console.log('View button clicked');
    const row = $(this).parents('tr');
    const rowData = dt_partners.row(row).data();
    const partnerId = rowData.id;

    console.log('Viewing partner:', { partnerId });

    // Fetch partner details
    $.ajax({
      url: `/partners/${partnerId}/get/`,
      type: 'GET',
      success: function (response) {
        console.log('Partner details:', response);
        if (response.success) {
          // Populate view modal fields
          const imagePreview = $('#viewPartnerImage');
          if (response.data.image) {
            console.log('Setting view image:', response.data.image);
            imagePreview.attr('src', response.data.image).show();
          } else {
            console.log('No image found, hiding view image');
            imagePreview.hide();
          }

          $('#viewPartnerName').text(response.data.name);
          $('#viewPartnerDescription').text(response.data.description || 'No description provided');
          $('#viewPartnerStatus').text(response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1));
          $('#viewPartnerDateCreated').text(response.data.date_created);

          // Show modal
          const viewPartnerModal = new bootstrap.Modal(document.getElementById('viewPartnerModal'));
          viewPartnerModal.show();
        } else {
          console.error('Failed to fetch partner details:', response.message);
          Swal.fire('Error!', response.message || 'Failed to fetch partner details.', 'error');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error fetching partner details:', { xhr, status, error });
        Swal.fire('Error!', 'An error occurred while fetching partner details.', 'error');
      }
    });
  });
});
