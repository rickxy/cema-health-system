// Initialize DataTable
let enrollmentsTable;
let clientsSelect;
let programsSelect;

$(document).ready(function () {
  console.log('Document ready - starting DataTables initialization');

  // Initialize DataTable
  enrollmentsTable = $('.datatables-enrollments').DataTable({
    ajax: {
      url: '/api/v1/enrollments/',
      dataSrc: 'data'
    },
    columns: [
      { data: 'client_name' },
      { data: 'program_name' },
      { data: 'enrolled_on' },
      {
        data: 'status',
        render: function (data) {
          const statusClass = {
            active: 'badge bg-label-success',
            completed: 'badge bg-label-info',
            dropped: 'badge bg-label-danger'
          };
          return `<span class="${statusClass[data]}">${data.charAt(0).toUpperCase() + data.slice(1)}</span>`;
        }
      },
      {
        data: null,
        render: function (data) {
          return `
            <div class="d-flex align-items-center">
              <a href="javascript:;" class="text-body view-enrollment" data-id="${data.id}">
                <i class="ti ti-eye ti-sm me-2"></i>
              </a>
              <a href="javascript:;" class="text-body edit-enrollment" data-id="${data.id}">
                <i class="ti ti-edit ti-sm me-2"></i>
              </a>
              <a href="javascript:;" class="text-body update-status" data-id="${data.id}">
                <i class="ti ti-refresh ti-sm me-2"></i>
              </a>
              <a href="javascript:;" class="text-body delete-enrollment" data-id="${data.id}">
                <i class="ti ti-trash ti-sm"></i>
              </a>
            </div>
          `;
        }
      }
    ],
    dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    displayLength: 7,
    lengthMenu: [7, 10, 25, 50, 75, 100],
    buttons: [
      {
        text: '<i class="bx bx-plus me-0 me-sm-1"></i><span class="d-none d-sm-inline-block">Enroll Client</span>',
        className: 'create-new btn btn-primary',
        action: function () {
          $('#enrollClientModal').modal('show');
        }
      }
    ],
    responsive: {
      details: {
        display: $.fn.dataTable.Responsive.display.modal({
          header: function (row) {
            const data = row.data();
            return 'Details of ' + data.client_name;
          }
        }),
        type: 'column',
        renderer: function (api, rowIdx, columns) {
          const data = $.map(columns, function (col, i) {
            return col.hidden
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
    }
  });

  // Initialize Select2 for client and program dropdowns
  clientsSelect = $('#enrollClient').select2({
    dropdownParent: $('#enrollClientModal'),
    placeholder: 'Select Client',
    allowClear: true
  });

  programsSelect = $('#enrollProgram').select2({
    dropdownParent: $('#enrollClientModal'),
    placeholder: 'Select Program',
    allowClear: true
  });

  // Load clients for enrollment
  loadClients();
  loadPrograms();

  // Handle enrollment form submission
  $('#enrollClientForm').on('submit', function (e) {
    e.preventDefault();
    console.log('Enrollment form submitted');

    const enrollmentId = $(this).data('enrollment-id');
    const formData = {
      client_id: $('#enrollClient').val(),
      program_id: $('#enrollProgram').val(),
      status: $('#enrollStatus').val()
    };
    console.log('Form data:', formData);

    const url = enrollmentId ? `/api/v1/enrollment/${enrollmentId}/update/` : '/api/v1/enrollment/create/';
    const method = enrollmentId ? 'POST' : 'POST';

    console.log('API URL:', url);
    console.log('Method:', method);

    $.ajax({
      url: url,
      method: method,
      contentType: 'application/json',
      data: JSON.stringify(formData),
      headers: {
        'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
      },
      success: function (response) {
        console.log('Enrollment save response:', response);
        $('#enrollClientModal').modal('hide');
        enrollmentsTable.ajax.reload();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: enrollmentId ? 'Enrollment updated successfully' : 'Client enrolled successfully',
          customClass: {
            container: 'swal2-container-custom'
          },
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      },
      error: function (xhr) {
        console.error('Error saving enrollment:', xhr);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: xhr.responseJSON.error || 'Failed to save enrollment',
          customClass: {
            container: 'swal2-container-custom'
          },
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  });

  // Handle view enrollment
  $('.datatables-enrollments').on('click', '.view-enrollment', function () {
    console.log('View enrollment clicked');
    const enrollmentId = $(this).data('id');
    console.log('Enrollment ID:', enrollmentId);

    // Get the enrollment data from the DataTable
    const rowData = enrollmentsTable.row($(this).closest('tr')).data();
    console.log('Row data:', rowData);

    if (!rowData) {
      console.error('No data found for enrollment');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Could not find enrollment data',
        customClass: {
          container: 'swal2-container-custom'
        },
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    // Get client enrollments
    $.ajax({
      url: `/api/v1/client/${rowData.client_id}/enrollments/`,
      method: 'GET',
      success: function (response) {
        console.log('Client enrollments response:', response);
        const enrollments = response.enrollments;
        const client = response.client;

        $('#viewClientName').text(client.name);
        $('#viewClientNationalId').text(`National ID: ${client.national_id}`);

        const tbody = $('#viewClientEnrollments tbody');
        tbody.empty();

        enrollments.forEach(function (enrollment) {
          const statusClass = {
            active: 'badge bg-label-success',
            completed: 'badge bg-label-info',
            dropped: 'badge bg-label-danger'
          };

          tbody.append(`
            <tr>
              <td>${enrollment.program_name}</td>
              <td>${enrollment.enrolled_on}</td>
              <td><span class="${
                statusClass[enrollment.status]
              }">${enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}</span></td>
              <td>
                <div class="d-flex align-items-center">
                  <a href="javascript:;" class="text-body delete-enrollment" data-id="${enrollment.id}">
                    <i class="ti ti-trash ti-sm"></i>
                  </a>
                </div>
              </td>
            </tr>
          `);
        });

        $('#viewClientEnrollmentsModal').modal('show');
      },
      error: function (xhr) {
        console.error('Error loading client enrollments:', xhr);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: xhr.responseJSON?.message || 'Failed to load client enrollments',
          customClass: {
            container: 'swal2-container-custom'
          },
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  });

  // Handle delete enrollment
  $('.datatables-enrollments').on('click', '.delete-enrollment', function () {
    const enrollmentId = $(this).data('id');
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3',
        cancelButton: 'btn btn-label-secondary'
      },
      buttonsStyling: false
    }).then(result => {
      if (result.isConfirmed) {
        $.ajax({
          url: `/api/v1/enrollment/${enrollmentId}/delete/`,
          method: 'POST',
          headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function () {
            enrollmentsTable.ajax.reload();
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Enrollment has been deleted.',
              customClass: {
                container: 'swal2-container-custom'
              },
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
          },
          error: function (xhr) {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: xhr.responseJSON.error || 'Failed to delete enrollment',
              customClass: {
                container: 'swal2-container-custom'
              },
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000
            });
          }
        });
      }
    });
  });

  // Handle update enrollment status
  $('.datatables-enrollments').on('click', '.update-status', function () {
    const enrollmentId = $(this).data('id');
    Swal.fire({
      title: 'Update Status',
      input: 'select',
      inputOptions: {
        active: 'Active',
        completed: 'Completed',
        dropped: 'Dropped'
      },
      inputPlaceholder: 'Select status',
      showCancelButton: true,
      confirmButtonText: 'Update',
      showLoaderOnConfirm: true,
      preConfirm: status => {
        return $.ajax({
          url: `/api/v1/enrollment/${enrollmentId}/update/`,
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ status: status }),
          headers: {
            'X-CSRFToken': $('input[name=csrfmiddlewaretoken]').val()
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(result => {
      if (result.isConfirmed) {
        enrollmentsTable.ajax.reload();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Enrollment status updated successfully',
          customClass: {
            container: 'swal2-container-custom'
          },
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    });
  });

  // Handle edit enrollment
  $('.datatables-enrollments').on('click', '.edit-enrollment', function () {
    console.log('Edit enrollment clicked');
    const enrollmentId = $(this).data('id');
    console.log('Enrollment ID:', enrollmentId);

    // Get the enrollment data from the DataTable
    const rowData = enrollmentsTable.row($(this).closest('tr')).data();
    console.log('Row data:', rowData);

    if (!rowData) {
      console.error('No data found for enrollment');
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Could not find enrollment data',
        customClass: {
          container: 'swal2-container-custom'
        },
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    // Populate the form with existing data
    $('#enrollClient').val(rowData.client_id).trigger('change');
    $('#enrollProgram').val(rowData.program_id).trigger('change');
    $('#enrollStatus').val(rowData.status);

    // Store the enrollment ID for the update
    $('#enrollClientForm').data('enrollment-id', enrollmentId);

    // Show the modal
    $('#enrollClientModal').modal('show');
  });
});

// Function to load clients for select2
function loadClients() {
  $.ajax({
    url: '/api/v1/clients/',
    type: 'GET',
    success: function (response) {
      const clients = response.data;
      clientsSelect.empty().append('<option value="">Select Client</option>');
      clients.forEach(function (client) {
        clientsSelect.append(
          `<option value="${client.id}">${client.first_name} ${client.last_name} (${client.national_id})</option>`
        );
      });
    }
  });
}

// Function to load programs for select2
function loadPrograms() {
  $.ajax({
    url: '/api/v1/programs/',
    type: 'GET',
    success: function (response) {
      const programs = response.data;
      programsSelect.empty().append('<option value="">Select Program</option>');
      programs.forEach(function (program) {
        programsSelect.append(`<option value="${program.id}">${program.name}</option>`);
      });
    }
  });
}
