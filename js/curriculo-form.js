document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('curriculo-form');
    if (!form) return;

    // Verificar se estamos em ambiente estático (preview/GitHub)
    const isStaticEnvironment = window.location.hostname.includes('github.io') || 
                               window.location.hostname.includes('pages.dev') || 
                               window.location.protocol === 'file:';

    const fileInput = form.querySelector('input[type="file"]');
    const fileLabel = form.querySelector('.file-input-label');
    const fileName = form.querySelector('.file-name');
    const submitButton = form.querySelector('button[type="submit"]');
    const submitText = submitButton.querySelector('.submit-text');
    const submitLoading = submitButton.querySelector('.submit-loading');
    const successMessage = form.querySelector('.form-message.success');
    const errorMessage = form.querySelector('.form-message.error');

    // Formatação do telefone
    const telefoneInput = form.querySelector('input[name="telefone"]');
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
            if (value.length > 2) value = value.replace(/^(\d{2})/, '($1) ');
            if (value.length > 7) value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value;
        }
    });

    // Atualização do nome do arquivo
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
// Validar tamanho (5MB)
if (file.size > 5 * 1024 * 1024) {
    alert('O arquivo deve ter no máximo 5MB');
    this.value = '';
    fileName.textContent = '';
    return;
}
            
// Validar tipo
if (file.type !== 'application/pdf') {
    alert('Por favor, selecione um arquivo PDF');
    this.value = '';
    fileName.textContent = '';
    return;
}
            
            fileName.textContent = file.name;
            fileLabel.classList.add('has-file');
        } else {
            fileName.textContent = '';
            fileLabel.classList.remove('has-file');
        }
    });

    // Manipulação do envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Esconder mensagens anteriores
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Desabilitar botão e mostrar loading
        submitButton.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
        
        // Simular envio em ambiente estático (preview/GitHub)
        if (isStaticEnvironment) {
            // Simular um atraso de processamento
            setTimeout(() => {
                try {
                    // Validar formulário
                    const requiredFields = ['nome', 'email', 'telefone', 'area'];
                    let isValid = true;
                    let emptyField = '';
                    
                    for (const field of requiredFields) {
                        const input = form.querySelector(`[name="${field}"]`);
                        if (!input.value.trim()) {
                            isValid = false;
                            emptyField = input.placeholder || field;
                            break;
                        }
                    }
                    
                    if (!isValid) {
                        throw new Error(`Por favor, preencha o campo ${emptyField}`);
                    }
                    
                    if (!fileInput.files[0]) {
                        throw new Error('Por favor, selecione um currículo para enviar');
                    }
                    
                    // Simular sucesso
                    successMessage.textContent = 'Currículo enviado com sucesso! (Modo de teste - em produção será enviado para oportunidades@smn.com.br)';
                    successMessage.style.display = 'block';
                    form.reset();
                    fileName.textContent = '';
                    fileLabel.classList.remove('has-file');
                } catch (error) {
                    errorMessage.textContent = error.message;
                    errorMessage.style.display = 'block';
                } finally {
                    // Reabilitar botão e esconder loading
                    submitButton.disabled = false;
                    submitText.style.display = 'inline';
                    submitLoading.style.display = 'none';
                }
            }, 1500); // Simular um atraso de 1.5 segundos para parecer mais real
            
            return;
        }
        
        // Processamento real para ambiente de produção
        try {
            const formData = new FormData(form);
            const response = await fetch('submit-curriculo.php', {
                method: 'POST',
                body: formData
            });

            // Verificar status da resposta antes de tentar parsear JSON
            if (!response.ok) {
                throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const result = await response.json();
                
                if (result.success) {
                    successMessage.textContent = 'Currículo enviado com sucesso!';
                    successMessage.style.display = 'block';
                    form.reset();
                    fileName.textContent = '';
                    fileLabel.classList.remove('has-file');
                } else {
                    errorMessage.textContent = result.error || 'Erro ao enviar o currículo';
                    errorMessage.style.display = 'block';
                }
            } else {
                throw new Error('Resposta do servidor não é JSON válido');
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Erro ao enviar o formulário. Tente novamente.';
            errorMessage.style.display = 'block';
            console.error('Erro no envio do formulário:', error);
        } finally {
            // Reabilitar botão e esconder loading
            submitButton.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    });
});
