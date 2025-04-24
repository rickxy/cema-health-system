/**
 * app-ecommerce-product-list
 */

'use strict';

// Initialize Toastr
$(document).ready(function () {
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
});

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
  var dt_product_table = $('.datatables-products'),
    productAdd = '/resources/create/',
    statusObj = {
      1: { title: 'Scheduled', class: 'bg-label-warning' },
      2: { title: 'Publish', class: 'bg-label-success' },
      3: { title: 'Inactive', class: 'bg-label-danger' },
      draft: { title: 'Draft', class: 'bg-label-secondary' },
      published: { title: 'Published', class: 'bg-label-success' },
      archived: { title: 'Archived', class: 'bg-label-danger' }
    },
    stockObj = {
      0: { title: 'Out_of_Stock' },
      1: { title: 'In_Stock' }
    },
    stockFilterValObj = {
      0: { title: 'Out of Stock' },
      1: { title: 'In Stock' }
    };

  // E-commerce Products datatable

  if (dt_product_table.length) {
    // Create a complete table structure if it doesn't exist
    if (!dt_product_table.find('thead').length || !dt_product_table.find('tbody').length) {
      // Clear the table first
      dt_product_table.empty();

      // Create thead with proper column headers
      var thead = $('<thead><tr></tr></thead>');
      thead.find('tr').append(
        '<th class="control"></th>' + // Control column
          '<th class="checkbox"></th>' + // Checkbox column
          '<th>Title</th>' +
          '<th>Publish</th>' +
          '<th>Status</th>' +
          '<th>Actions</th>'
      );

      // Create tbody
      var tbody = $('<tbody></tbody>');

      // Append thead and tbody to the table
      dt_product_table.append(thead).append(tbody);

      // Add required classes to the table
      dt_product_table.addClass('datatables-products table');
    }

    try {
      var dt_products = dt_product_table.DataTable({
        ajax: {
          url: '/resources/data/',
          dataSrc: 'data',
          error: function (xhr, error, thrown) {
            toastr.error('Failed to load resources', 'Error');
          }
        },
        pageLength: 10,
        order: [[6, 'desc']],
        columns: [
          { data: null, defaultContent: '' },
          { data: null, defaultContent: '' },
          { data: 'title' },
          { data: 'is_published' },
          { data: 'status' },
          { data: null, defaultContent: '' },
          { data: 'date_created', visible: false }
        ],
        columnDefs: [
          {
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
            targets: 2,
            responsivePriority: 1,
            render: function (data, type, full, meta) {
              var $name = full['title'] || '',
                $id = full['id'] || '',
                $product_brand = full['subtitle'] || '',
                $image = full['image'] || '';

              var $output = '';
              if ($image) {
                $output =
                  '<img src="' +
                  $image +
                  '" alt="Title-' +
                  $id +
                  '" class="rounded-2" style="width: 40px; height: 40px; object-fit: cover;">';
              } else {
                var stateNum = Math.floor(Math.random() * 6);
                var states = ['success', 'danger', 'warning', 'info', 'dark', 'primary', 'secondary'];
                var $state = states[stateNum],
                  $name = full['subtitle'] || '',
                  $initials = $name.match(/\b\w/g) || [];
                $initials = (($initials.shift() || '') + ($initials.pop() || '')).toUpperCase();
                $output = '<span class="avatar-initial rounded-2 bg-label-' + $state + '">' + $initials + '</span>';
              }
              var $row_output =
                '<div class="d-flex justify-content-start align-items-center product-name">' +
                '<div class="avatar-wrapper">' +
                '<div class="avatar avatar me-2 rounded-2 bg-label-secondary">' +
                $output +
                '</div>' +
                '</div>' +
                '<div class="d-flex flex-column">' +
                '<h6 class="text-body text-nowrap mb-0">' +
                $name +
                '</h6>' +
                '<small class="text-muted text-truncate d-none d-sm-block">' +
                $product_brand +
                '</small>' +
                '</div>' +
                '</div>';
              return $row_output;
            }
          },
          {
            targets: 3,
            orderable: false,
            responsivePriority: 3,
            render: function (data, type, full, meta) {
              var $stock = full['is_published'] || false;
              var $id = full['id'] || '';

              $stock = $stock === true || $stock === 'true' || $stock === 1;

              var stockSwitchObj = {
                Out_of_Stock:
                  '<label class="switch switch-primary switch-sm">' +
                  '<input type="checkbox" class="switch-input publish-toggle" data-id="' +
                  $id +
                  '">' +
                  '<span class="switch-toggle-slider">' +
                  '<span class="switch-off">' +
                  '</span>' +
                  '</span>' +
                  '</label>',
                In_Stock:
                  '<label class="switch switch-primary switch-sm">' +
                  '<input type="checkbox" class="switch-input publish-toggle" data-id="' +
                  $id +
                  '" checked="">' +
                  '<span class="switch-toggle-slider">' +
                  '<span class="switch-on">' +
                  '</span>' +
                  '</span>' +
                  '</label>'
              };
              return (
                "<span class='text-truncate'>" +
                stockSwitchObj[$stock ? 'In_Stock' : 'Out_of_Stock'] +
                '<span class="d-none">' +
                ($stock ? 'Published' : 'Not Published') +
                '</span>' +
                '</span>'
              );
            }
          },
          {
            targets: 4,
            render: function (data, type, full, meta) {
              var $status = full['status'] || 'draft';

              if (!statusObj[$status]) {
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
            targets: 5,
            title: 'Actions',
            searchable: false,
            orderable: false,
            render: function (data, type, full, meta) {
              return (
                '<div class="d-inline-block text-nowrap">' +
                '<button class="btn btn-sm btn-icon view-record"><i class="ti ti-eye"></i></button>' +
                '<button class="btn btn-sm btn-icon edit-record"><i class="ti ti-edit"></i></button>' +
                '<button class="btn btn-sm btn-icon delete-record"><i class="ti ti-trash"></i></button>' +
                '</div>'
              );
            }
          }
        ],
        dom:
          '<"card-header d-flex border-top rounded-0 flex-wrap py-2"' +
          '<"me-5 ms-n2 pe-5"f>' +
          '<"d-flex justify-content-start justify-content-md-end align-items-baseline"<"dt-action-buttons d-flex flex-column align-items-start align-items-md-center justify-content-sm-center mb-3 mb-md-0 pt-0 gap-4 gap-sm-0 flex-sm-row"lB>>' +
          '>t' +
          '<"row mx-2"' +
          '<"col-sm-12 col-md-6"i>' +
          '<"col-sm-12 col-md-6"p>' +
          '>',
        lengthMenu: [7, 10, 20, 50, 70, 100],
        language: {
          sLengthMenu: '_MENU_',
          search: '',
          searchPlaceholder: 'Search Product',
          info: 'Displaying _START_ to _END_ of _TOTAL_ entries'
        },
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
                  columns: [1, 2, 3, 4, 5, 6, 7],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('product-name')) {
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
                  columns: [1, 2, 3, 4, 5, 6, 7],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('product-name')) {
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
                  columns: [1, 2, 3, 4, 5, 6, 7],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('product-name')) {
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
                  columns: [1, 2, 3, 4, 5, 6, 7],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('product-name')) {
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
                  columns: [1, 2, 3, 4, 5, 6, 7],
                  format: {
                    body: function (inner, coldex, rowdex) {
                      if (inner.length <= 0) return inner;
                      var el = $.parseHTML(inner);
                      var result = '';
                      $.each(el, function (index, item) {
                        if (item.classList !== undefined && item.classList.contains('product-name')) {
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
            text: '<i class="ti ti-plus me-0 me-sm-1 ti-xs"></i><span class="d-none d-sm-inline-block">Add Resouce</span>',
            className: 'add-new btn btn-primary ms-2 ms-sm-0',
            action: function () {
              window.location.href = productAdd;
            }
          }
        ],
        responsive: {
          details: {
            display: $.fn.dataTable.Responsive.display.modal({
              header: function (row) {
                var data = row.data();
                return 'Details of ' + data['title'];
              }
            }),
            type: 'column',
            renderer: function (api, rowIdx, columns) {
              var data = $.map(columns, function (col, i) {
                return col.title !== ''
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
          this.api()
            .columns(-2)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="ProductStatus" class="form-select text-capitalize"><option value="">Status</option></select>'
              )
                .appendTo('.product_status')
                .on('change', function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  if (statusObj[d] && statusObj[d].title) {
                    select.append('<option value="' + statusObj[d].title + '">' + statusObj[d].title + '</option>');
                  }
                });
            });
          this.api()
            .columns(3)
            .every(function () {
              var column = this;
              var select = $(
                '<select id="ProductStock" class="form-select text-capitalize"><option value=""> Stock </option></select>'
              )
                .appendTo('.product_stock')
                .on('change', function () {
                  var val = $.fn.dataTable.util.escapeRegex($(this).val());
                  column.search(val ? '^' + val + '$' : '', true, false).draw();
                });

              column
                .data()
                .unique()
                .sort()
                .each(function (d, j) {
                  if (stockObj[d] && stockObj[d].title && stockFilterValObj[d] && stockFilterValObj[d].title) {
                    select.append(
                      '<option value="' + stockObj[d].title + '">' + stockFilterValObj[d].title + '</option>'
                    );
                  }
                });
            });
        }
      });

      $('.dataTables_length').addClass('mt-2 mt-sm-0 mt-md-3 me-2');
      $('.dt-buttons').addClass('d-flex flex-wrap');
    } catch (error) {
      toastr.error('Failed to initialize table', 'Error');
    }
  }

  // Delete Record
  $(document).on('click', '.datatables-products .btn-icon.delete-record', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $row = $(this).closest('tr');
    var rowData = dt_products.row($row).data();

    if (!rowData) {
      toastr.error('No data found for this resource', 'Error');
      return;
    }

    var resourceId = rowData.id;
    var resourceName = rowData.title;

    Swal.fire({
      title: 'Delete Resource',
      text: `Are you sure you want to delete "${resourceName}"?`,
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
          url: '/resources/delete/' + resourceId + '/',
          type: 'POST',
          data: {
            csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
          },
          success: function (response) {
            if (response.success) {
              Swal.fire({
                title: 'Deleted!',
                text: 'The resource has been deleted.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: false,
                showCloseButton: false
              }).then(() => {
                dt_products.row($row).remove().draw();
              });
            } else {
              Swal.fire('Error!', response.message || 'Failed to delete resource.', 'error');
            }
          },
          error: function () {
            Swal.fire('Error!', 'An error occurred while deleting the resource.', 'error');
          }
        });
      }
    });
  });

  // Edit Record
  $(document).on('click', '.datatables-products .btn-icon.edit-record', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $row = $(this).closest('tr');
    var rowData = dt_products.row($row).data();

    if (!rowData) {
      toastr.error('No data found for this resource', 'Error');
      return;
    }

    var resourceId = rowData.id;

    $.ajax({
      url: '/resources/details/' + resourceId + '/',
      type: 'GET',
      success: function (response) {
        $('#editResourceId').val(response.data.id);
        $('#editTitle').val(response.data.title);
        $('#editSubtitle').val(response.data.subtitle);
        $('#editDescription').val(response.data.description);
        $('#editStatus').val(response.data.status);
        $('#editIsPublished').prop('checked', response.data.is_published);

        if (response.data.image_url) {
          $('#editImagePreview').attr('src', response.data.image_url).show();
        } else {
          $('#editImagePreview').hide();
        }

        $('#editResourceModal').modal('show');
      },
      error: function (xhr, status, error) {
        toastr.error('Failed to fetch resource details', 'Error');
      }
    });
  });

  // Handle image preview when a new image is selected
  $('#editImage').on('change', function () {
    var file = this.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        $('#editImagePreview').attr('src', e.target.result).show();
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle edit form submission
  $('#editResourceForm').on('submit', function (e) {
    e.preventDefault();
    var resourceId = $('#editResourceId').val();
    var formData = new FormData(this);

    $.ajax({
      url: '/resources/edit/' + resourceId + '/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        $('#editResourceModal').modal('hide');
        toastr.success('Resource updated successfully', 'Success');
        dt_products.ajax.reload();
      },
      error: function (xhr, status, error) {
        toastr.error('Failed to update resource', 'Error');
      }
    });
  });

  // Toggle Publish Status
  $('.datatables-products tbody').on('change', '.publish-toggle', function () {
    var resourceId = $(this).data('id');
    var isPublished = $(this).prop('checked');
    var $switch = $(this);
    var $row = $switch.closest('tr');

    $switch.prop('disabled', true);

    $.ajax({
      url: '/resources/toggle-publish/' + resourceId + '/',
      type: 'POST',
      data: {
        is_published: isPublished,
        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
      },
      success: function (response) {
        var rowData = dt_products.row($row).data();
        rowData.is_published = isPublished;
        dt_products.row($row).data(rowData);
        toastr.success('Resource ' + (isPublished ? 'published' : 'unpublished') + ' successfully', 'Success');
      },
      error: function (xhr, status, error) {
        $switch.prop('checked', !isPublished);
        toastr.error('Failed to update publish status', 'Error');
      },
      complete: function () {
        $switch.prop('disabled', false);
      }
    });
  });

  // Filter form control to default size
  setTimeout(() => {
    $('.dataTables_filter .form-control').removeClass('form-control-sm');
    $('.dataTables_length .form-select').removeClass('form-select-sm');
  }, 300);

  // View Record
  $(document).on('click', '.datatables-products .btn-icon.view-record', function (e) {
    e.preventDefault();
    e.stopPropagation();

    var $row = $(this).closest('tr');
    var rowData = dt_products.row($row).data();

    if (!rowData) {
      toastr.error('No data found for this resource', 'Error');
      return;
    }

    var resourceId = rowData.id;

    $.ajax({
      url: '/resources/details/' + resourceId + '/',
      type: 'GET',
      success: function (response) {
        var modalContent = `
          <div class="modal fade" id="viewResourceModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="viewResourceModalTitle">Resource Details</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <div class="col-md-4 mb-3">
                      <div class="card h-100">
                        <div class="card-body text-center">
                          ${
                            response.data.image_url
                              ? `<img src="${response.data.image_url}" alt="${response.data.title}" class="img-fluid rounded-2" style="max-height: 200px; object-fit: cover;">`
                              : `<div class="avatar-initial rounded-2 bg-label-secondary" style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center;">
                              <span class="fs-1">${response.data.title.charAt(0).toUpperCase()}</span>
                            </div>`
                          }
                        </div>
                      </div>
                    </div>
                    <div class="col-md-8 mb-3">
                      <div class="card h-100">
                        <div class="card-body">
                          <h5 class="card-title">${response.data.title}</h5>
                          <h6 class="card-subtitle mb-2 text-muted">${response.data.subtitle || ''}</h6>
                          <p class="card-text">${response.data.description || ''}</p>
                          <div class="mt-3">
                            <span class="badge ${response.data.is_published ? 'bg-label-success' : 'bg-label-warning'}">
                              ${response.data.is_published ? 'Published' : 'Draft'}
                            </span>
                            <span class="badge bg-label-info ms-2">
                              ${response.data.status.charAt(0).toUpperCase() + response.data.status.slice(1)}
                            </span>
                          </div>
                          <div class="mt-3">
                            <small class="text-muted">Created: ${response.data.date_created}</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-label-secondary" data-bs-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
        `;

        $('#viewResourceModal').remove();
        $('body').append(modalContent);
        var viewModal = new bootstrap.Modal(document.getElementById('viewResourceModal'));
        viewModal.show();
      },
      error: function (xhr, status, error) {
        toastr.error('Failed to fetch resource details', 'Error');
      }
    });
  });
});
