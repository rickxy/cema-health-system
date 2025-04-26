/**
 * Page Clients List
 */

'use strict';

// Datatable (jquery)
$(function () {
  console.log('Document ready - starting DataTables initialization');

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
  var dt_clients_table = $('.datatables-clients'),
    select2 = $('.select2'),
    genderObj = {
      Male: { title: 'Male', class: 'bg-label-primary' },
      Female: { title: 'Female', class: 'bg-label-info' },
      Other: { title: 'Other', class: 'bg-label-warning' }
    };

  console.log('Table element found:', dt_clients_table.length > 0);
  console.log('Table HTML:', dt_clients_table.html());

  // Initialize Select2
  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>');
      $this.select2({
        placeholder: 'Select Gender',
        dropdownParent: $this.parent()
      });
    });
  }

  // Clients datatable
  if (dt_clients_table.length) {
    console.log('Initializing DataTable...');
    try {
      var dt_clients = dt_clients_table.DataTable({
        processing: true,
        serverSide: false,
        ajax: {
          url: '/api/v1/clients/',
          type: 'GET',
          dataSrc: 'data',
          error: function (xhr, error, thrown) {
            console.error('AJAX Error:', error);
            console.error('Response:', xhr.responseText);
          }
        },
        columns: [
          { data: 'first_name' },
          { data: 'last_name' },
          { data: 'national_id' },
          { data: 'phone_number' },
          {
            data: 'gender',
            render: function (data, type, row) {
              return `<span class="badge ${genderObj[data].class}">${data}</span>`;
            }
          },
          {
            data: 'date_of_birth',
            render: function (data, type, row) {
              if (type === 'display' && data) {
                return new Date(data).toLocaleDateString();
              }
              return data;
            }
          },
          {
            data: 'registered_on',
            render: function (data, type, row) {
              if (type === 'display' && data) {
                return new Date(data).toLocaleDateString();
              }
              return data;
            }
          },
          { data: 'id', visible: false },
          {
            data: null,
            orderable: false,
            render: function (data, type, row) {
              return (
                '<div class="d-flex align-items-center">' +
                '<a href="javascript:;" class="text-body edit-record"><i class="ti ti-edit ti-sm me-2"></i></a>' +
                '<a href="javascript:;" class="text-body delete-record"><i class="ti ti-trash ti-sm"></i></a>' +
                '</div>'
              );
            }
          }
        ],
        order: [[7, 'desc']], // Sort by id (index 7) in descending order
        pageLength: 10,
        responsive: true,
        autoWidth: false,
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
            text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add New Client</span>',
            className: 'add-new btn btn-primary ms-3',
            attr: {
              'data-bs-toggle': 'offcanvas',
              'data-bs-target': '#offcanvasAddClient'
            }
          }
        ],
        initComplete: function (settings, json) {
          console.log('DataTable initialization complete');
          console.log('Settings:', settings);
          console.log('Initial data:', json);

          // Initialize gender filter
          this.api()
            .columns(4)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="FilterGender" class="form-select text-capitalize"><option value="">Select Gender</option></select>'
              )
                .appendTo('.user_gender')
                .on('change', function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d) {
                  if (d && genderObj[d]) {
                    select.append('<option value="' + d + '">' + d + '</option>');
                  }
                });
            });
        },
        error: function (xhr, error, thrown) {
          console.error('DataTable Error:', error);
          console.error('Response:', xhr.responseText);
        }
      });
      console.log('DataTable initialized successfully');

      // Delete Record
      $('.datatables-clients tbody').on('click', '.delete-record', function () {
        const row = $(this).closest('tr');
        const rowData = dt_clients.row(row).data();
        const clientId = rowData.id;
        const clientName = `${rowData.first_name} ${rowData.last_name}`;

        // Show SweetAlert2 confirmation dialog
        Swal.fire({
          title: 'Are you sure?',
          text: `You are about to delete client "${clientName}". This action cannot be undone.`,
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
              url: `/api/v1/client/${clientId}/delete/`,
              type: 'POST',
              headers: {
                'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
              },
              success: function (response) {
                if (response.status === 'success') {
                  // Remove the row from the table
                  dt_clients.row(row).remove().draw();

                  // Show success message
                  Swal.fire({
                    title: 'Deleted!',
                    text: 'The client has been deleted.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                  });
                } else {
                  Swal.fire('Error!', response.message || 'Failed to delete client.', 'error');
                }
              },
              error: function (xhr, status, error) {
                let errorMessage = 'An error occurred while deleting the client.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                  errorMessage = xhr.responseJSON.message;
                }
                Swal.fire('Error!', errorMessage, 'error');
              }
            });
          }
        });
      });

      // Handle add client form submission
      $('#addClientForm').on('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = {
          first_name: $('#clientFirstName').val(),
          last_name: $('#clientLastName').val(),
          national_id: $('#clientNationalId').val(),
          phone_number: $('#clientPhoneNumber').val(),
          gender: $('#clientGender').val(),
          date_of_birth: $('#clientDateOfBirth').val(),
          address: $('#clientAddress').val()
        };

        // Validate form data
        if (
          !formData.first_name ||
          !formData.last_name ||
          !formData.national_id ||
          !formData.gender ||
          !formData.date_of_birth
        ) {
          Swal.fire({
            title: 'Validation Error',
            text: 'Please fill in all required fields.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
          return;
        }

        // Get submit button and store original text
        const $submitButton = $('#submit-client-form');
        const originalButtonText = $submitButton.html();

        // Show loading state
        $submitButton.html(
          '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...'
        );
        $submitButton.prop('disabled', true);

        // Disable all form inputs during submission
        $('#addClientForm :input').prop('disabled', true);

        // Send AJAX request
        $.ajax({
          url: '/api/v1/client/create/',
          type: 'POST',
          contentType: 'application/json',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          },
          data: JSON.stringify(formData),
          success: function (response) {
            // Restore button state
            $submitButton.html(originalButtonText);
            $submitButton.prop('disabled', false);

            // Re-enable form inputs
            $('#addClientForm :input').prop('disabled', false);

            if (response.status === 'success') {
              // Refresh the DataTable
              dt_clients.ajax.reload();

              // Hide the offcanvas
              const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasAddClient'));
              offcanvas.hide();

              // Reset the form
              $('#addClientForm')[0].reset();

              // Show success notification
              Swal.fire({
                title: 'Success!',
                text: `Client ${formData.first_name} ${formData.last_name} has been added successfully.`,
                icon: 'success',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true,
                customClass: {
                  popup: 'swal2-toast',
                  container: 'swal2-container-custom'
                },
                didOpen: toast => {
                  toast.addEventListener('mouseenter', Swal.stopTimer);
                  toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
              });
            } else {
              // Show error notification
              Swal.fire({
                title: 'Error',
                text: response.message || 'Failed to create client.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          },
          error: function (xhr, status, error) {
            // Restore button state
            $submitButton.html(originalButtonText);
            $submitButton.prop('disabled', false);

            // Re-enable form inputs
            $('#addClientForm :input').prop('disabled', false);

            // Show error notification
            let errorMessage = 'An error occurred while creating the client.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
              errorMessage = xhr.responseJSON.message;
            }

            Swal.fire({
              title: 'Error',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      });

      // Edit Record
      $('.datatables-clients tbody').on('click', '.edit-record', function () {
        const row = $(this).parents('tr');
        const rowData = dt_clients.row(row).data();
        const clientId = rowData.id;

        // Populate form fields
        $('#editClientId').val(clientId);
        $('#editClientFirstName').val(rowData.first_name);
        $('#editClientLastName').val(rowData.last_name);
        $('#editClientNationalId').val(rowData.national_id);
        $('#editClientPhoneNumber').val(rowData.phone_number);
        $('#editClientGender').val(rowData.gender);
        $('#editClientDateOfBirth').val(rowData.date_of_birth);
        $('#editClientAddress').val(rowData.address);

        // Show modal
        const editClientModal = new bootstrap.Modal(document.getElementById('editClientModal'));
        editClientModal.show();
      });

      // Handle edit form submission
      $('#editClientForm').on('submit', function (e) {
        e.preventDefault();
        const clientId = $('#editClientId').val();
        const formData = {
          first_name: $('#editClientFirstName').val(),
          last_name: $('#editClientLastName').val(),
          national_id: $('#editClientNationalId').val(),
          phone_number: $('#editClientPhoneNumber').val(),
          gender: $('#editClientGender').val(),
          date_of_birth: $('#editClientDateOfBirth').val(),
          address: $('#editClientAddress').val()
        };

        // Send update request
        $.ajax({
          url: `/api/v1/client/${clientId}/edit/`,
          type: 'POST',
          contentType: 'application/json',
          headers: {
            'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
          },
          data: JSON.stringify(formData),
          success: function (response) {
            if (response.status === 'success') {
              // Close modal
              const editClientModal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
              editClientModal.hide();

              // Update the row in the table
              dt_clients.ajax.reload();

              // Show success message
              Swal.fire({
                title: 'Success!',
                text: 'Client updated successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
              });
            } else {
              Swal.fire('Error!', response.message || 'Failed to update client.', 'error');
            }
          },
          error: function (xhr, status, error) {
            Swal.fire('Error!', 'An error occurred while updating the client.', 'error');
          }
        });
      });
    } catch (error) {
      console.error('Error initializing DataTable:', error);
      console.error('Error stack:', error.stack);
    }
  } else {
    console.error('Table element not found');
  }

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
