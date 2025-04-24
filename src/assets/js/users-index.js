/**
 * Page User List
 */

'use strict';

// Datatable (jquery)
$(function () {
  let borderColor, bodyBg, headingColor;
  let dt_user; // Declare dt_user in the outer scope

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
  var dt_user_table = $('.datatables-users'),
    select2 = $('.select2'),
    userView = '/users/view/',
    statusObj = {
      1: { title: 'Pending', class: 'bg-label-warning' },
      2: { title: 'Active', class: 'bg-label-success' },
      3: { title: 'Inactive', class: 'bg-label-secondary' }
    };

  if (select2.length) {
    var $this = select2;
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Country',
      dropdownParent: $this.parent()
    });
  }

  // Users datatable
  if (dt_user_table.length) {
    dt_user = dt_user_table.DataTable({
      ajax: {
        url: '/users/api/users/',
        type: 'GET',
        dataSrc: 'data' // Specify the data source property
      },
      columns: [
        // columns according to JSON
        { data: '' },
        { data: 'full_name' },
        { data: 'role' },
        { data: 'email' },
        { data: 'last_login' },
        { data: 'date_joined' },
        { data: 'status' },
        { data: 'action' }
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
          // User full name and email
          targets: 1,
          responsivePriority: 4,
          render: function (data, type, full, meta) {
            var $name = full['full_name'],
              $email = full['email'],
              $image = full['avatar'];
            if ($image) {
              // For Avatar image
              var $output =
                '<img src="' + assetsPath + 'img/avatars/' + $image + '" alt="Avatar" class="rounded-circle">';
            } else {
              // For Avatar badge
              var stateNum = Math.floor(Math.random() * 6);
              var states = ['success', 'danger', 'warning', 'info', 'primary', 'secondary'];
              var $state = states[stateNum],
                $name = full['full_name'],
                $initials = $name.match(/\b\w/g) || [];
              $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
              $output = '<span class="avatar-initial rounded-circle bg-label-' + $state + '">' + $initials + '</span>';
            }
            // Creates full output for row
            var $row_output =
              '<div class="d-flex justify-content-start align-items-center user-name">' +
              '<div class="avatar-wrapper">' +
              '<div class="avatar me-3">' +
              $output +
              '</div>' +
              '</div>' +
              '<div class="d-flex flex-column">' +
              '<a href="' +
              userView +
              full.id +
              '/" class="text-body text-truncate"><span class="fw-medium">' +
              $name +
              '</span></a>' +
              '<small class="text-muted">' +
              $email +
              '</small>' +
              '</div>' +
              '</div>';
            return $row_output;
          }
        },
        {
          // User Role
          targets: 2,
          render: function (data, type, full, meta) {
            var $role = full['role'];
            var roleBadgeObj = {
              Subscriber:
                '<span class="badge badge-center rounded-pill bg-label-warning w-px-30 h-px-30 me-2"><i class="ti ti-user ti-sm"></i></span>',
              Author:
                '<span class="badge badge-center rounded-pill bg-label-success w-px-30 h-px-30 me-2"><i class="ti ti-circle-check ti-sm"></i></span>',
              Clerk:
                '<span class="badge badge-center rounded-pill bg-label-primary w-px-30 h-px-30 me-2"><i class="ti ti-chart-pie-2 ti-sm"></i></span>',
              Editor:
                '<span class="badge badge-center rounded-pill bg-label-info w-px-30 h-px-30 me-2"><i class="ti ti-edit ti-sm"></i></span>',
              Admin:
                '<span class="badge badge-center rounded-pill bg-label-secondary w-px-30 h-px-30 me-2"><i class="ti ti-device-laptop ti-sm"></i></span>'
            };

            // Default badge for roles not in the predefined list
            var defaultBadge =
              '<span class="badge badge-center rounded-pill bg-label-primary w-px-30 h-px-30 me-2"><i class="ti ti-user ti-sm"></i></span>';

            return (
              "<span class='text-truncate d-flex align-items-center'>" +
              (roleBadgeObj[$role] || defaultBadge) +
              $role +
              '</span>'
            );
          }
        },
        {
          // Email
          targets: 3,
          render: function (data, type, full, meta) {
            return '<span class="fw-medium">' + full['email'] + '</span>';
          }
        },
        {
          // Last Login
          targets: 4,
          render: function (data, type, full, meta) {
            return '<span class="fw-medium">' + (full['last_login'] || 'Never') + '</span>';
          }
        },
        {
          // Date Joined
          targets: 5,
          render: function (data, type, full, meta) {
            return '<span class="fw-medium">' + full['date_joined'] + '</span>';
          }
        },
        {
          // User Status
          targets: 6,
          render: function (data, type, full, meta) {
            var $status = full['status'];

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
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            return (
              '<div class="d-flex align-items-center">' +
              '<a href="javascript:;" class="text-body edit-record"><i class="ti ti-edit ti-sm me-2"></i></a>' +
              '<a href="javascript:;" class="text-body delete-record"><i class="ti ti-trash ti-sm mx-2"></i></a>' +
              '<a href="javascript:;" class="text-body dropdown-toggle hide-arrow" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-sm mx-1"></i></a>' +
              '<div class="dropdown-menu dropdown-menu-end m-0">' +
              '<a href="javascript:;" class="dropdown-item view-record">View</a>' +
              '<a href="javascript:;" class="dropdown-item status-toggle">' +
              (full.status === 2 ? 'Deactivate' : 'Activate') +
              '</a>' +
              '</div>' +
              '</div>'
            );
          }
        }
      ],
      order: [[1, 'desc']],
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
      // Buttons with Dropdown
      buttons: [
        {
          extend: 'collection',
          className: 'btn btn-label-secondary dropdown-toggle mx-3',
          text: '<i class="ti ti-screen-share me-1 ti-xs"></i>Export',
          buttons: [
            {
              extend: 'print',
              text: '<i class="ti ti-printer me-2" ></i>Print',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                // prevent avatar to be print
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
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
                //customize print view for dark
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
              text: '<i class="ti ti-file-text me-2" ></i>Csv',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
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
              text: '<i class="ti ti-file-spreadsheet me-2"></i>Excel',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
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
              text: '<i class="ti ti-file-code-2 me-2"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
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
              text: '<i class="ti ti-copy me-2" ></i>Copy',
              className: 'dropdown-item',
              exportOptions: {
                columns: [1, 2, 3, 4, 5, 6],
                // prevent avatar to be display
                format: {
                  body: function (inner, coldex, rowdex) {
                    if (inner.length <= 0) return inner;
                    var el = $.parseHTML(inner);
                    var result = '';
                    $.each(el, function (index, item) {
                      if (item.classList !== undefined && item.classList.contains('user-name')) {
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
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add New User</span>',
          className: 'add-new btn btn-primary',
          attr: {
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#offcanvasAddUser'
          }
        }
      ],
      // For responsive popup
      responsive: {
        details: {
          display: $.fn.dataTable.Responsive.display.modal({
            header: function (row) {
              var data = row.data();
              return 'Details of ' + data['full_name'];
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
        // Adding role filter once table initialized
        this.api()
          .columns(2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="UserRole" class="form-select text-capitalize"><option value=""> Select Role </option></select>'
            )
              .appendTo('.user_role')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>');
              });
          });
        // Adding status filter once table initialized
        this.api()
          .columns(6)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="FilterTransaction" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
            )
              .appendTo('.user_status')
              .on('change', function () {
                var val = $.fn.dataTable.util.escapeRegex($(this).val());
                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append(
                  '<option value="' +
                    statusObj[d].title +
                    '" class="text-capitalize">' +
                    statusObj[d].title +
                    '</option>'
                );
              });
          });
      }
    });
  }

  // Delete Record
  $('.datatables-users tbody').on('click', '.delete-record', function () {
    const row = $(this).closest('tr');
    const rowData = dt_user.row(row).data();
    const userId = rowData.id;
    const userName = rowData.full_name;

    // Show SweetAlert2 confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete user "${userName}". This action cannot be undone.`,
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
        // Send delete request
        $.ajax({
          url: `/users/api/users/${userId}/delete/`,
          type: 'POST',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            if (response.status === 'success') {
              // Remove the row from the table
              dt_user.row(row).remove().draw();

              // Show success message
              Swal.fire({
                title: 'Deleted!',
                text: 'The user has been deleted.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: false
              });
            } else {
              Swal.fire('Error!', response.message || 'Failed to delete user.', 'error');
            }
          },
          error: function (xhr, status, error) {
            let errorMessage = 'An error occurred while deleting the user.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
              errorMessage = xhr.responseJSON.message;
            }
            Swal.fire({
              title: 'Error!',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
          }
        });
      }
    });
  });

  // Edit Record
  $('.datatables-users tbody').on('click', '.edit-record', function () {
    const row = $(this).parents('tr');
    const rowData = dt_user.row(row).data();
    const userId = rowData.id;

    // Fetch user details
    $.ajax({
      url: `/users/api/users/${userId}/edit/`,
      type: 'GET',
      success: function (response) {
        if (response.status === 'success') {
          // Populate form fields
          $('#editUserId').val(response.data.id);
          $('#editFirstName').val(response.data.first_name);
          $('#editLastName').val(response.data.last_name);
          $('#editEmail').val(response.data.email);
          $('#editRole').val(response.data.role);
          $('#editStatus').val(response.data.status);

          // Show modal
          const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
          editUserModal.show();
        } else {
          Swal.fire('Error!', response.message || 'Failed to fetch user details.', 'error');
        }
      },
      error: function (xhr, status, error) {
        Swal.fire('Error!', 'An error occurred while fetching user details.', 'error');
      }
    });
  });

  // Handle edit form submission
  $('#editUserForm').on('submit', function (e) {
    e.preventDefault();
    const userId = $('#editUserId').val();
    const formData = {
      first_name: $('#editFirstName').val(),
      last_name: $('#editLastName').val(),
      email: $('#editEmail').val(),
      role: $('#editRole').val(),
      status: $('#editStatus').val()
    };

    // Send update request
    $.ajax({
      url: `/users/api/users/${userId}/edit/`,
      type: 'POST',
      contentType: 'application/json',
      headers: {
        'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      data: JSON.stringify(formData),
      success: function (response) {
        if (response.status === 'success') {
          // Close modal
          const editUserModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
          editUserModal.hide();

          // Update the row in the table
          const row = dt_user.row(`#${userId}`);
          row.data(response.user).draw();

          // Show success message
          Swal.fire({
            title: 'Success!',
            text: 'User updated successfully.',
            icon: 'success',
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false,
            showCloseButton: false
          });
        } else {
          Swal.fire('Error!', response.message || 'Failed to update user.', 'error');
        }
      },
      error: function (xhr, status, error) {
        Swal.fire('Error!', 'An error occurred while updating the user.', 'error');
      }
    });
  });

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);

  // Validation & Phone mask
  const phoneMaskList = document.querySelectorAll('.phone-mask');
  const addNewUserForm = document.getElementById('addNewUserForm');

  // Phone Number
  if (phoneMaskList) {
    phoneMaskList.forEach(function (phoneMask) {
      new Cleave(phoneMask, {
        phone: true,
        phoneRegionCode: 'US'
      });
    });
  }

  $('#addNewUserForm').on('submit', function (e) {
    console.log('Form submitted');
    e.preventDefault();

    const formData = {
      first_name: $('#add-user-firstname').val(),
      last_name: $('#add-user-lastname').val(),
      email: $('#add-user-email').val(),
      contact: $('#add-user-contact').val(),
      country: $('#add-user-country').val(),
      role: $('#add-user-role').val(),
      password: 'password123'
    };
    console.log('Form data:', formData);

    const $submitButton = $('#submit-user-form');
    const originalButtonText = $submitButton.html();
    $submitButton.html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
    $submitButton.prop('disabled', true);

    function getCookie(name) {
      let cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    const csrftoken = getCookie('csrftoken');
    console.log('CSRF Token:', csrftoken);

    $.ajax({
      url: '/users/api/users/create/',
      type: 'POST',
      contentType: 'application/json',
      headers: {
        'X-CSRFToken': csrftoken
      },
      data: JSON.stringify(formData),
      success: function (response) {
        $submitButton.html(originalButtonText);
        $submitButton.prop('disabled', false);

        // Check if response is HTML (login page)
        if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
          // User is not authenticated, redirect to login
          window.location.href = '/login/';
          return;
        }

        if (response.status === 'success') {
          // Add new user to DataTable
          dt_user.row.add(response.user).draw();

          $('#offcanvasAddUser').offcanvas('hide');

          $('#addNewUserForm')[0].reset();

          if (typeof toastr !== 'undefined') {
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
              hideMethod: 'fadeOut',
              toastClass: 'toast toast-success',
              containerId: 'toast-container',
              rtl: false,
              tapToDismiss: true,
              escapeHtml: true,
              iconClass: 'toast-success-icon',
              closeHtml:
                '<button type="button" class="toast-close-button" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
            };

            // Add custom CSS for the toast
            if (!$('#toast-custom-css').length) {
              $('head').append(`
                <style id="toast-custom-css">
                  #toast-container > div {
                    opacity: 1;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border-radius: 4px;
                    padding: 15px 15px 15px 50px;
                    width: 300px;
                    border-left: 4px solid #71dd37;
                  }
                  #toast-container > div:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
                    opacity: 1;
                    cursor: pointer;
                  }
                  #toast-container > .toast-success {
                    background-color: #fff;
                    color: #333;
                  }
                  #toast-container > .toast-success .toast-close-button {
                    color: #333;
                    text-shadow: none;
                    opacity: 0.5;
                  }
                  #toast-container > .toast-success .toast-close-button:hover {
                    opacity: 1;
                  }
                  #toast-container > .toast-success .toast-title {
                    font-weight: 600;
                    font-size: 16px;
                  }
                  #toast-container > .toast-success .toast-message {
                    font-size: 14px;
                  }
                  #toast-container > .toast-success .toast-progress {
                    background-color: #71dd37;
                  }
                </style>
              `);
            }

            // Show success toast with custom message
            toastr.success('User has been successfully created', 'Success!');
          } else if (typeof Swal !== 'undefined') {
            // Fallback to SweetAlert if toastr is not available
            Swal.fire({
              title: 'Success!',
              text: 'User created successfully',
              icon: 'success',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
          } else {
            // Fallback to alert if neither toastr nor Swal is available
            alert('User created successfully');
          }
        } else {
          // Show error message
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              title: 'Error!',
              text: response.message || 'Failed to create user',
              icon: 'error',
              customClass: {
                confirmButton: 'btn btn-primary'
              },
              buttonsStyling: false
            });
          } else {
            alert('Error: ' + (response.message || 'Failed to create user'));
          }
        }
      },
      error: function (xhr, status, error) {
        console.error('Ajax error:', { xhr, status, error });

        // Restore submit button
        $submitButton.html(originalButtonText);
        $submitButton.prop('disabled', false);

        if (xhr.responseText && xhr.responseText.includes('<!DOCTYPE html>')) {
          window.location.href = '/login/';
          return;
        }

        // Check if the error is due to a duplicate email
        let errorMessage = 'Failed to create user';
        if (xhr.responseJSON) {
          if (xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
          } else if (xhr.responseJSON.email && xhr.responseJSON.email.includes('unique')) {
            errorMessage = 'A user with this email already exists. Please use a different email address.';
          } else if (xhr.responseJSON.error) {
            errorMessage = xhr.responseJSON.error;
          }
        }

        // Show error toast notification
        if (typeof toastr !== 'undefined') {
          // Configure toastr options for error
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
            hideMethod: 'fadeOut',
            // Custom styling for error toast
            toastClass: 'toast toast-error',
            containerId: 'toast-container',
            rtl: false,
            tapToDismiss: true,
            escapeHtml: true,
            closeHtml:
              '<button type="button" class="toast-close-button" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
          };

          // Add custom CSS for error toast if not already added
          if (!$('#toast-error-css').length) {
            $('head').append(`
              <style id="toast-error-css">
                #toast-container > .toast-error {
                  background-color: #fff;
                  color: #333;
                  border-left: 4px solid #ff3e1d;
                }
                #toast-container > .toast-error .toast-progress {
                  background-color: #ff3e1d;
                }
              </style>
            `);
          }

          // Show error toast
          toastr.error(errorMessage, 'Error!');
        } else if (typeof Swal !== 'undefined') {
          // Fallback to SweetAlert if toastr is not available
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            customClass: {
              confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
          });
        } else {
          // Fallback to alert if neither toastr nor Swal is available
          alert('Error: ' + errorMessage);
        }
      }
    });
  });

  // Add event handler for status toggle
  $('.datatables-users tbody').on('click', '.status-toggle', function (e) {
    e.preventDefault();
    const row = $(this).closest('tr');
    const rowData = dt_user.row(row).data();
    const userId = rowData.id;
    const userName = rowData.full_name;
    const currentStatus = rowData.status === 2; // 2 is active, 3 is inactive

    // Show confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${currentStatus ? 'deactivate' : 'activate'} user "${userName}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${currentStatus ? 'deactivate' : 'activate'} it!`,
      cancelButtonText: 'No, cancel!',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        // Send status update request
        $.ajax({
          url: `/users/api/users/${userId}/status/`,
          type: 'POST',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          },
          success: function (response) {
            if (response.status === 'success') {
              // Update the row data
              rowData.status = response.is_active ? 2 : 3;
              dt_user.row(row).data(rowData).draw();

              // Show success message
              Swal.fire({
                title: 'Success!',
                text: response.message,
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: false
              });
            } else {
              Swal.fire('Error!', response.message || 'Failed to update user status.', 'error');
            }
          },
          error: function (xhr, status, error) {
            Swal.fire('Error!', 'An error occurred while updating the user status.', 'error');
          }
        });
      }
    });
  });

  // View User Details
  $('.datatables-users tbody').on('click', '.view-record', function () {
    const row = $(this).closest('tr');
    const rowData = dt_user.row(row).data();
    const userId = rowData.id;

    // Update modal content with user data
    $('#viewUserName').text(rowData.full_name);
    $('#viewUserEmail').text(rowData.email);
    $('#viewUserRole').text(rowData.role);
    $('#viewUserStatus').html(
      '<span class="badge ' + statusObj[rowData.status].class + '">' + statusObj[rowData.status].title + '</span>'
    );
    $('#viewUserLastLogin').text(rowData.last_login || 'Never');
    $('#viewUserDateJoined').text(rowData.date_joined);

    // Update avatar
    const avatarHtml = rowData.avatar
      ? `<img src="${assetsPath}img/avatars/${rowData.avatar}" alt="Avatar" class="rounded-circle">`
      : `<span class="avatar-initial rounded-circle bg-label-primary">${rowData.full_name.charAt(0)}</span>`;
    $('#viewUserAvatar').html(avatarHtml);

    // Fetch activity logs
    $.ajax({
      url: `/users/view/${userId}/`,
      type: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      success: function (response) {
        console.log('[DEBUG] Activity logs response:', response);

        // Clear existing logs
        $('#viewUserActivityLogs tbody').empty();

        // Check if activity_logs exists in the response
        if (response.activity_logs && Array.isArray(response.activity_logs)) {
          // Add each log to the table
          response.activity_logs.forEach(log => {
            const statusClass = log.status === 'success' ? 'bg-label-success' : 'bg-label-danger';
            const row = `
              <tr class="small">
                <td class="text-muted">${log.action}</td>
                <td class="text-muted">${log.section}</td>
                <td class="text-muted">${log.description}</td>
                <td><span class="badge ${statusClass}">${log.status}</span></td>
                <td class="text-muted">${new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            `;
            $('#viewUserActivityLogs tbody').append(row);
          });

          // Add a note about limited logs
          $('#viewUserActivityLogs tbody').append(`
            <tr>
              <td colspan="5" class="text-center text-muted">
                <small>Showing 5 most recent activities</small>
              </td>
            </tr>
          `);
        } else {
          // Show message if no activity logs found
          $('#viewUserActivityLogs tbody').html(`
            <tr>
              <td colspan="5" class="text-center text-muted">No activity logs found</td>
            </tr>
          `);
        }
      },
      error: function (xhr, status, error) {
        console.error('[DEBUG] Error fetching activity logs:', error);
        $('#viewUserActivityLogs tbody').html(`
          <tr>
            <td colspan="5" class="text-center text-muted">Failed to load activity logs</td>
          </tr>
        `);
      }
    });

    // Show modal
    const viewUserModal = new bootstrap.Modal(document.getElementById('viewUserModal'));
    viewUserModal.show();
  });
});
