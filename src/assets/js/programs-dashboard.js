/**
 * Page Programs List
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
  var dt_programs_table = $('.datatables-programs'),
    select2 = $('.select2'),
    statusObj = {
      true: { title: 'Active', class: 'bg-label-success' },
      false: { title: 'Inactive', class: 'bg-label-secondary' }
    };

  if (select2.length) {
    var $this = select2;
    $this.wrap('<div class="position-relative"></div>').select2({
      placeholder: 'Select Status',
      dropdownParent: $this.parent()
    });
  }

  // Programs datatable
  if (dt_programs_table.length) {
    var dt_programs = dt_programs_table.DataTable({
      ajax: {
        url: '/api/v1/programs/',
        type: 'GET',
        dataSrc: 'data'
      },
      columns: [
        { data: 'name', width: '25%' },
        { data: 'description', width: '40%' },
        { data: 'is_active', width: '15%' },
        { data: 'id', visible: false },
        { data: 'actions', width: '20%', orderable: false }
      ],
      order: [[3, 'desc']], // Sort by id (index 3) in descending order
      columnDefs: [
        {
          // Name
          targets: 0,
          render: function (data, type, full, meta) {
            return '<span class="fw-medium">' + data + '</span>';
          }
        },
        {
          // Description
          targets: 1,
          render: function (data, type, full, meta) {
            return '<span class="text-truncate">' + (data || 'No description') + '</span>';
          }
        },
        {
          // Status
          targets: 2,
          render: function (data, type, full, meta) {
            const statusClass = data ? 'bg-label-success' : 'bg-label-secondary';
            const statusTitle = data ? 'Active' : 'Inactive';
            return `<span class="badge ${statusClass}">${statusTitle}</span>`;
          }
        },
        {
          // Actions
          targets: -1,
          title: 'Actions',
          searchable: false,
          orderable: false,
          render: function (data, type, full, meta) {
            const toggleIcon = full.is_active ? 'ti-toggle-left' : 'ti-toggle-right';
            return (
              '<div class="d-flex align-items-center">' +
              '<a href="javascript:;" class="text-body toggle-status" data-id="' +
              full.id +
              '"><i class="ti ' +
              toggleIcon +
              ' ti-sm me-2"></i></a>' +
              '<a href="javascript:;" class="text-body edit-record"><i class="ti ti-edit ti-sm me-2"></i></a>' +
              '<a href="javascript:;" class="text-body delete-record"><i class="ti ti-trash ti-sm"></i></a>' +
              '</div>'
            );
          }
        }
      ],
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
                columns: [0, 1, 2]
              }
            },
            {
              extend: 'csv',
              text: '<i class="ti ti-file-text me-2" ></i>Csv',
              className: 'dropdown-item',
              exportOptions: {
                columns: [0, 1, 2]
              }
            },
            {
              extend: 'excel',
              text: '<i class="ti ti-file-spreadsheet me-2"></i>Excel',
              className: 'dropdown-item',
              exportOptions: {
                columns: [0, 1, 2]
              }
            },
            {
              extend: 'pdf',
              text: '<i class="ti ti-file-code-2 me-2"></i>Pdf',
              className: 'dropdown-item',
              exportOptions: {
                columns: [0, 1, 2]
              }
            },
            {
              extend: 'copy',
              text: '<i class="ti ti-copy me-2" ></i>Copy',
              className: 'dropdown-item',
              exportOptions: {
                columns: [0, 1, 2]
              }
            }
          ]
        },
        {
          text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add New Program</span>',
          className: 'add-new btn btn-primary',
          attr: {
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#offcanvasAddProgram'
          }
        }
      ],
      initComplete: function () {
        // Adding status filter once table initialized
        this.api()
          .columns(2)
          .every(function () {
            var column = this;
            var select = $(
              '<select id="FilterStatus" class="form-select text-capitalize"><option value=""> Select Status </option></select>'
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

    // Handle add program form submission
    $('#addProgramForm').on('submit', function (e) {
      e.preventDefault();

      // Get form data
      const formData = {
        name: $('#programName').val(),
        description: $('#programDescription').val(),
        is_active: $('#programStatus').val() === 'true'
      };

      // Get submit button and store original text
      const $submitButton = $('#submit-program-form');
      const originalButtonText = $submitButton.html();

      // Show loading state
      $submitButton.html(
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...'
      );
      $submitButton.prop('disabled', true);

      // Disable all form inputs during submission
      $('#addProgramForm :input').prop('disabled', true);

      // Send AJAX request
      $.ajax({
        url: '/api/v1/program/create/',
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
          $('#addProgramForm :input').prop('disabled', false);

          if (response.status === 'success') {
            // Refresh the DataTable
            dt_programs.ajax.reload();

            // Hide the offcanvas
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasAddProgram'));
            offcanvas.hide();

            // Reset the form
            $('#addProgramForm')[0].reset();

            // Show success notification
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              customClass: {
                popup: 'swal2-toast',
                container: 'swal2-container-custom'
              },
              didOpen: toast => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'success',
              title: 'Program created successfully!',
              background: '#28a745',
              color: '#fff',
              iconColor: '#fff'
            });
          } else {
            // Show error notification
            const Toast = Swal.mixin({
              toast: true,
              position: 'top',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              customClass: {
                popup: 'swal2-toast',
                container: 'swal2-container-custom'
              },
              didOpen: toast => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
              }
            });

            Toast.fire({
              icon: 'error',
              title: response.message || 'Failed to create program.',
              background: '#dc3545',
              color: '#fff',
              iconColor: '#fff'
            });
          }
        },
        error: function (xhr, status, error) {
          // Restore button state
          $submitButton.html(originalButtonText);
          $submitButton.prop('disabled', false);

          // Re-enable form inputs
          $('#addProgramForm :input').prop('disabled', false);

          // Show error notification
          let errorMessage = 'An error occurred while creating the program.';
          if (xhr.responseJSON && xhr.responseJSON.message) {
            errorMessage = xhr.responseJSON.message;
          }

          const Toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            customClass: {
              popup: 'swal2-toast',
              container: 'swal2-container-custom'
            },
            didOpen: toast => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
          });

          Toast.fire({
            icon: 'error',
            title: errorMessage,
            background: '#dc3545',
            color: '#fff',
            iconColor: '#fff'
          });
        }
      });
    });

    // Delete Record
    $('.datatables-programs tbody').on('click', '.delete-record', function () {
      const row = $(this).closest('tr');
      const rowData = dt_programs.row(row).data();
      const programId = rowData.id;
      const programName = rowData.name;

      // Show SweetAlert2 confirmation dialog
      Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete program "${programName}". This action cannot be undone.`,
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
            url: `/api/v1/program/${programId}/delete/`,
            type: 'POST',
            headers: {
              'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
            },
            success: function (response) {
              if (response.status === 'success') {
                // Remove the row from the table
                dt_programs.row(row).remove().draw();

                // Show success message
                Swal.fire({
                  title: 'Deleted!',
                  text: 'The program has been deleted.',
                  icon: 'success',
                  timer: 2000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire('Error!', response.message || 'Failed to delete program.', 'error');
              }
            },
            error: function (xhr, status, error) {
              let errorMessage = 'An error occurred while deleting the program.';
              if (xhr.responseJSON && xhr.responseJSON.message) {
                errorMessage = xhr.responseJSON.message;
              }
              Swal.fire('Error!', errorMessage, 'error');
            }
          });
        }
      });
    });

    // Edit Record
    $('.datatables-programs tbody').on('click', '.edit-record', function () {
      const row = $(this).parents('tr');
      const rowData = dt_programs.row(row).data();
      const programId = rowData.id;

      // Populate form fields
      $('#editProgramId').val(programId);
      $('#editProgramName').val(rowData.name);
      $('#editProgramDescription').val(rowData.description);
      $('#editProgramStatus').val(rowData.is_active.toString());

      // Show modal
      const editProgramModal = new bootstrap.Modal(document.getElementById('editProgramModal'));
      editProgramModal.show();
    });

    // Handle edit form submission
    $('#editProgramForm').on('submit', function (e) {
      e.preventDefault();
      const programId = $('#editProgramId').val();
      const formData = {
        name: $('#editProgramName').val(),
        description: $('#editProgramDescription').val(),
        is_active: $('#editProgramStatus').val() === 'true'
      };

      // Send update request
      $.ajax({
        url: `/api/v1/program/${programId}/edit/`,
        type: 'POST',
        contentType: 'application/json',
        headers: {
          'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
        },
        data: JSON.stringify(formData),
        success: function (response) {
          if (response.status === 'success') {
            // Close modal
            const editProgramModal = bootstrap.Modal.getInstance(document.getElementById('editProgramModal'));
            editProgramModal.hide();

            // Update the row in the table
            dt_programs.ajax.reload();

            // Show success message
            Swal.fire({
              title: 'Success!',
              text: 'Program updated successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          } else {
            Swal.fire('Error!', response.message || 'Failed to update program.', 'error');
          }
        },
        error: function (xhr, status, error) {
          Swal.fire('Error!', 'An error occurred while updating the program.', 'error');
        }
      });
    });

    // Handle status toggle
    $('.datatables-programs tbody').on('click', '.toggle-status', function () {
      const programId = $(this).data('id');
      const $icon = $(this).find('i');
      const $row = $(this).closest('tr');

      // Show loading state
      $icon.removeClass('ti-toggle-left ti-toggle-right').addClass('ti-loader ti-spin');

      // Send toggle request
      $.ajax({
        url: `/api/v1/program/${programId}/toggle-status/`,
        type: 'POST',
        headers: {
          'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
        },
        success: function (response) {
          if (response.status === 'success') {
            // Update the status badge
            const isActive = response.is_active;
            const $badge = $row.find('td:eq(2) .badge');

            $badge
              .removeClass('bg-label-success bg-label-secondary')
              .addClass(isActive ? 'bg-label-success' : 'bg-label-secondary')
              .text(isActive ? 'Active' : 'Inactive');

            // Update the toggle icon
            $icon.removeClass('ti-loader ti-spin').addClass(isActive ? 'ti-toggle-left' : 'ti-toggle-right');

            // Show success message
            const Toast = Swal.mixin({
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              customClass: {
                popup: 'swal2-toast',
                container: 'swal2-container-custom'
              }
            });

            Toast.fire({
              icon: 'success',
              title: response.message
            });
          } else {
            // Show error message
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message
            });
          }
        },
        error: function (xhr) {
          // Show error message
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: xhr.responseJSON?.message || 'An error occurred while updating the status'
          });

          // Reset the icon
          $icon.removeClass('ti-loader ti-spin').addClass('ti-toggle-left ti-toggle-right');
        }
      });
    });
  }

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);
});
