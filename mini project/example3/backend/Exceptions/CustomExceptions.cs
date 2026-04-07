using System;

namespace SocietyFinance.API.Exceptions
{
    /// <summary>
    /// Custom exception for resource not found scenarios
    /// </summary>
    public class ResourceNotFoundException : Exception
    {
        public ResourceNotFoundException(string message) : base(message) { }
        public ResourceNotFoundException(string resourceName, int id)
            : base($"{resourceName} with id {id} was not found.") { }
    }

    /// <summary>
    /// Custom exception for validation errors
    /// </summary>
    public class ValidationException : Exception
    {
        public Dictionary<string, string[]> Errors { get; }

        public ValidationException() : base("One or more validation errors occurred.")
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationException(string message) : base(message)
        {
            Errors = new Dictionary<string, string[]>();
        }

        public ValidationException(Dictionary<string, string[]> errors)
            : base("One or more validation errors occurred.")
        {
            Errors = errors;
        }
    }

    /// <summary>
    /// Custom exception for business logic violations
    /// </summary>
    public class BusinessException : Exception
    {
        public BusinessException(string message) : base(message) { }
    }

    /// <summary>
    /// Custom exception for duplicate operations
    /// </summary>
    public class DuplicateException : Exception
    {
        public DuplicateException(string message) : base(message) { }
    }
}
